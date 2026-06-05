import React, { useState, useCallback, useRef } from 'react';
import BaseNode from './BaseNode';
import { darkThemeColors } from '../../../styles/theme';
import { NodeType, NodeCategory } from '../../../../shared/types/node';

interface SingleFileInputNodeProps {
  data?: any;
  selected?: boolean;
}

const SingleFileInputNode: React.FC<SingleFileInputNodeProps> = ({ data = {}, selected = false }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/single', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.code === 200 && data?.onChange) {
        data.onChange('fileUrl', result.data.fileUrl);
        data.onChange('fileName', result.data.fileName);
        data.onChange('fileSize', result.data.fileSize);
        data.onChange('fileType', result.data.mimeType);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [data]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDelete = useCallback(() => {
    if (data?.onChange) {
      data.onChange('fileUrl', null);
      data.onChange('fileName', undefined);
      data.onChange('fileSize', undefined);
      data.onChange('fileType', undefined);
    }
  }, [data]);

  const fileUrl = data?.fileUrl;
  const fileName = data?.fileName;
  const fileSize = data?.fileSize;
  const fileType = data?.fileType;

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

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="singleFileInput"
      label="单文件输入"
      icon="📁"
      outputs={[{ id: 'file', label: '文件', dataType: 'FILE' }]}
    >
      <div style={{ width: '100%' }}>
        {fileUrl ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: darkThemeColors.bgTertiary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>
                {getFileIcon(fileType)}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: darkThemeColors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fileName}
                </div>
                {fileSize && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: darkThemeColors.textSecondary,
                      marginTop: '2px',
                    }}
                  >
                    {formatFileSize(fileSize)}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDelete}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: '80px',
              border: `2px dashed ${darkThemeColors.border}`,
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: darkThemeColors.bgTertiary,
              transition: 'all 0.2s',
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
                  点击上传文件
                </span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </BaseNode>
  );
};

export default SingleFileInputNode;
