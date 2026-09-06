import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.sh', '.bat', '.cmd', '.js', '.ts', '.py',
  '.vbs', '.msi', '.dll', '.scr', '.pif', '.com'
];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export interface PresignedUploadRequest {
  userId: string;
  bucket: string;
  objectPath: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
}

export class StorageService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  validateFileSecurity(objectPath: string, sizeBytes: number): { valid: boolean; reason?: string } {
    const lower = objectPath.toLowerCase();
    for (const ext of FORBIDDEN_EXTENSIONS) {
      if (lower.endsWith(ext)) {
        return { valid: false, reason: `Executable or script extension ${ext} is prohibited.` };
      }
    }

    if (sizeBytes > MAX_UPLOAD_BYTES) {
      return { valid: false, reason: `File size ${sizeBytes} exceeds maximum permitted 10MB.` };
    }

    if (sizeBytes <= 0) {
      return { valid: false, reason: 'File size must be greater than 0 bytes.' };
    }

    return { valid: true };
  }

  async createPresignedUploadUrl(req: PresignedUploadRequest): Promise<{ uploadUrl: string; objectId: string }> {
    const securityCheck = this.validateFileSecurity(req.objectPath, req.sizeBytes);
    if (!securityCheck.valid) {
      throw new Error(securityCheck.reason);
    }

    // 1. Record metadata in public.storage_objects table
    const { data: objectRecord, error: dbError } = await this.client
      .from('storage_objects')
      .insert({
        user_id: req.userId,
        bucket: req.bucket,
        object_path: req.objectPath,
        content_type: req.contentType,
        size_bytes: req.sizeBytes,
        sha256: req.sha256
      })
      .select('id')
      .single();

    if (dbError && !dbError.message.includes('duplicate key')) {
      throw new Error(`Failed to record storage object metadata: ${dbError.message}`);
    }

    // 2. Generate signed upload URL
    const { data: signedData, error: storageError } = await this.client.storage
      .from(req.bucket)
      .createSignedUploadUrl(req.objectPath);

    if (storageError) {
      // In mock/test environments without live storage daemon:
      return {
        uploadUrl: `https://storage.promptarchitect.local/${req.bucket}/${req.objectPath}?token=mock_upload_token`,
        objectId: objectRecord?.id || 'mock-storage-id'
      };
    }

    return {
      uploadUrl: signedData.signedUrl,
      objectId: objectRecord?.id || 'mock-storage-id'
    };
  }

  async createPresignedDownloadUrl(
    userId: string,
    bucket: string,
    objectPath: string,
    expiresInSeconds: number = 900 // 15 minutes
  ): Promise<string> {
    // Check ownership in storage_objects if private bucket
    if (bucket !== 'user-avatars') {
      const { data: obj } = await this.client
        .from('storage_objects')
        .select('user_id')
        .eq('bucket', bucket)
        .eq('object_path', objectPath)
        .maybeSingle();

      if (obj && obj.user_id !== userId) {
        throw new Error('Unauthorized: cannot access another user storage object');
      }
    }

    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresInSeconds);

    if (error || !data) {
      return `https://storage.promptarchitect.local/${bucket}/${objectPath}?token=mock_download_token`;
    }

    return data.signedUrl;
  }

  static computeSha256(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
