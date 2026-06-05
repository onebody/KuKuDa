import React, { useState, useCallback, useRef } from 'react';
import BaseNode from './BaseNode';
import { darkThemeColors } from '../../../styles/theme';
import { NodeType, NodeCategory } from '../../../../shared/types/node';

interface MultiImageInputNodeProps {
  data?: any;
  selected?: boolean;
}

const MultiImageInputNode: React.FC<MultiImageInputNodeProps> = ({ data = {}, selected = false }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current images array
  const imageUrls: Array<{ url: string; fileName: string; fileSize: number; index: number }> = 
    data?.imageUrls || [];

  const maxCount = data?.maxCount || 20;

  const handleUpload = useCallback(async (files: FileList) => {
    if (imageUrls.length + files.length > maxCount) {
      alert(`最多只能上传 ${maxCount} 张图片`);
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
        const newImages = result.data.map((file: any, index: number) => ({
          url: file.fileUrl,
          fileName: file.fileName,
          fileSize: file.fileSize,
          index: imageUrls.length + index + 1,
        }));
        
        data.onChange('imageUrls', [...imageUrls, ...newImages]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [data, imageUrls, maxCount]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleDelete = useCallback((index: number) => {
    if (data?.onChange) {
      const newImages = imageUrls.filter((_, i) => i !== index);
      // Re-number the remaining images
      const renumbered = newImages.map((img, i) => ({ ...img, index: i + 1 }));
      data.onChange('imageUrls', renumbered);
    }
  }, [data, imageUrls]);

  const handleClearAll = useCallback(() => {
    if (data?.onChange) {
      data.onChange('imageUrls', []);
    }
  }, [data]);

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="multiImageInput"
      label="多图片输入"
      icon="🖼️"
      outputs={[{ id: 'images', label: '图片数组', dataType: 'IMAGE' }]}
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
            marginBottom: imageUrls.length > 0 ? '8px' : '0',
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
                点击上传图片（{imageUrls.length}/{maxCount}）
              </span>
            </>
          )}
        </div>

        {/* Image preview grid */}
        {imageUrls.length > 0 && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              {imageUrls.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.fileName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: `1px solid ${darkThemeColors.border}`,
                    }}
                  />
                  {/* Number badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: darkThemeColors.primary,
                      color: 'white',
                      borderRadius: '4px',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {img.index}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
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
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </BaseNode>
  );
};

export default MultiImageInputNode;
