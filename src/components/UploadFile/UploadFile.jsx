"use client";
import React, { useEffect, useState } from "react";
import { message, Upload, Modal, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const uploadProps = {
  showUploadList: { showPreviewIcon: true },
  beforeUpload: (file) => {
    const isValidType = file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg";
    if (!isValidType) {
      message.error("Fișierul trebuie să fie de tipul: png, jpg, jpeg.");
      return Upload.LIST_IGNORE;
    }

    return false;
  },
};

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UploadFile = ({ value = [], onChange, defaultPreview, listType = "picture-card" }) => {
  const [fileList, setFileList] = useState(value);

  useEffect(() => {
    if (defaultPreview && value.length === 0) {
      setFileList([
        {
          uid: "-1",
          name: "default-logo.png",
          status: "done",
          url: defaultPreview,
        },
      ]);
    }
  }, [defaultPreview]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (onChange) {
      onChange(newFileList);
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleCancel = () => setPreviewOpen(false);

  return (
    <>
      <Upload listType={listType} fileList={fileList} onPreview={handlePreview} onChange={handleChange} {...uploadProps}>
        {fileList.length >= 1 ? null : (
          <div>
            <PlusOutlined />
            <div
              style={{
                marginTop: 6,
              }}
            >
              Selectează fișierul
            </div>
          </div>
        )}
      </Upload>
      
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
        width={800}
        style={{ top: 20 }}
        centered
      >
        <div className="tw-flex tw-justify-center tw-items-center tw-p-4">
          <Image
            alt={previewTitle}
            src={previewImage}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
            preview={false}
            className="tw-rounded-md tw-shadow-md"
          />
        </div>
      </Modal>
    </>
  );
};

UploadFile.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  defaultPreview: PropTypes.string,
  listType: PropTypes.string,
};

export default UploadFile;
