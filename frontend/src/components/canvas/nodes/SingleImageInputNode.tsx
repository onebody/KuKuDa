import React, { useState, useCallback, useRef } from 'react';
import BaseNode from './BaseNode';
import { darkThemeColors } from '../../../styles/theme';
import { NodeType, NodeCategory } from '../../../../shared/types/node';

interface SingleImageInputNodeProps {
  data?: any;
  selected?: boolean;
}

const SingleImageInputNode: React.FC<SingleImageInputNodeProps> = ({ data = {}, selected = false }) => {
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
        data.onChange('imageUrl', result.data.fileUrl);
        data.onChange('fileName', result.data.fileName);
        data.onChange('fileSize', result.data.fileSize);
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
      data.onChange('imageUrl', null);
      data.onChange('fileName', undefined);
      data.onChange('fileSize', undefined);
    }
  }, [data]);

  const imageUrl = data?.imageUrl;
  const fileName = data?.fileName;

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="singleImageInput"
      label="单图片输入"
      icon="🖼️"
      outputs={[{ id: 'image', label: '图片', dataType: 'IMAGE' }]}
    >
      <div style={{ width: '100%' }}>
        {imageUrl ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src={imageUrl}
              alt={fileName || 'uploaded'}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: `1px solid ${darkThemeColors.border}`,
              }}
            />
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
            {fileName && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  color: darkThemeColors.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: '100px',
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
                  点击上传图片
                </span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </BaseNode>
  );
};

export default SingleImageInputNode;
