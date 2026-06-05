import React, { useState, useCallback, useRef } from 'react';
import BaseNode from './BaseNode';
import { darkThemeColors } from '../../../styles/theme';
import { NodeType, NodeCategory } from '../../../../shared/types/node';

interface MultiFileInputNodeProps {
  data?: any;
  selected?: boolean;
}

const MultiFileInputNode: React.FC<MultiFileInputNodeProps> = ({ data = {}, selected = false }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current files array
  const fileUrls: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }> = data?.fileUrls || [];

  const maxCount = data?.maxCount || 50;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word')) return '📝';
    if (type?.includes('excel') || type?.includes('sheet')) return '📊';
    if (type?.includes('zip')) return '🗜️';
    return '📁';
  };

  const handleUpload = useCallback(async (files: FileList) => {
    if (fileUrls.length + files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 个文件`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/batch', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.code === 200 && data?.onChange) {
        const newFiles = result.data.map((file: any, index: number) => ({
          url: file.fileUrl,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.mimeType,
        }));
        
        data.onChange('fileUrls', [...fileUrls, ...newFiles]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [data, fileUrls, maxCount]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleDelete = useCallback((index: number) => {
    if (data?.onChange) {
      const newFiles = fileUrls.filter((_, i) => i !== index);
      data.onChange('fileUrls', newFiles);
    }
  }, [data, fileUrls]);

  const handleClearAll = useCallback(() => {
    if (data?.onChange) {
      data.onChange('fileUrls', []);
    }
  }, [data]);

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="multiFileInput"
      label="多文件输入"
      icon="📁"
      outputs={[{ id: 'files', label: '文件数组', dataType: 'FILE' }]}
    >
      <div style={{ width: '100%' }}>
        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            minHeight: '80px',
            border: `2px dashed ${darkThemeColors.border}`,
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: darkThemeColors.bgTertiary,
            transition: 'all 0.2s',
            marginBottom: fileUrls.length > 0 ? '8px' : '0',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = darkThemeColors.primary;
            e.currentTarget.style.backgroundColor = darkThemeColors.bgSecondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = darkThemeColors.border;
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary;
          }}
        >
          {uploading ? (
            <span style={{ fontSize: '24px' }}>⏳</span>
          ) : (
            <>
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>+</span>
              <span style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                点击上传文件（{fileUrls.length}/{maxCount}）
              </span>
            </>
          )}
        </div>

        {/* File list */}
        {fileUrls.length > 0 && (
          <div>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: '8px',
              }}
            >
              {fileUrls.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px',
                    backgroundColor: darkThemeColors.bgTertiary,
                    borderRadius: '4px',
                    marginBottom: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ marginRight: '6px' }}>
                    {getFileIcon(file.fileType)}
                  </span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: darkThemeColors.textPrimary,
                      }}
                    >
                      {file.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: darkThemeColors.textSecondary,
                      }}
                    >
                      {formatFileSize(file.fileSize)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    style={{
                      marginLeft: '6px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Clear all button */}
            <button
              onClick={handleClearAll}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: '#ff4444',
                border: `1px solid rgba(255, 0, 0, 0.3)`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              清空所有
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </BaseNode>
  );
};

export default MultiFileInputNode;
