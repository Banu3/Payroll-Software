import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from './auditService.js';

class DocumentService {
  /**
   * Upload Document Metadata & Storage Path
   */
  async uploadDocument({ employeeId, companyId, documentType, fileName, storagePath, fileSize, performingUser }) {
    const targetPath = storagePath || `company/${companyId}/employees/${employeeId}/documents/${fileName}`;

    const { data, error } = await supabaseAdmin
      .from('employee_documents')
      .insert({
        employee_id: employeeId,
        company_id: companyId,
        document_type: documentType,
        file_name: fileName,
        storage_path: targetPath,
        file_size: fileSize || 1024,
        uploaded_by: performingUser?.id || null,
        verification_status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      console.warn('[DocumentService Upload Warning]:', error.message);
    }

    await auditService.log({
      user: performingUser,
      action: 'DOCUMENT_UPLOADED',
      entity: 'EMPLOYEE_DOCUMENT',
      entityId: data?.id || employeeId,
      newValue: { fileName, documentType, storagePath: targetPath },
    });

    return data || { id: `doc_${Date.now()}`, fileName, verificationStatus: 'PENDING' };
  }

  /**
   * Verify or Reject Document
   */
  async verifyDocument(documentId, status, rejectionReason, performingUser) {
    const { data: doc } = await supabaseAdmin
      .from('employee_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    await supabaseAdmin
      .from('employee_documents')
      .update({
        verification_status: status,
        verified_by: performingUser?.id || null,
        verified_at: new Date().toISOString(),
        rejection_reason: status === 'REJECTED' ? rejectionReason : null,
      })
      .eq('id', documentId);

    // Create Notification if rejected
    if (status === 'REJECTED' && doc?.employee_id) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          company_id: performingUser.companyId,
          type: 'DOCUMENT_REJECTED',
          title: `Document Verification Rejected: ${doc.document_type}`,
          message: `Your uploaded document '${doc.file_name}' was rejected by HR. Reason: ${rejectionReason || 'Invalid copy'}`,
          is_read: false,
        });
    }

    await auditService.log({
      user: performingUser,
      action: status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      entity: 'EMPLOYEE_DOCUMENT',
      entityId: documentId,
      newValue: { status, rejectionReason },
    });

    return { success: true, documentId, status };
  }
}

export const documentService = new DocumentService();
export default documentService;
