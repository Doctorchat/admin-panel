"use client";
import React, { useEffect, useState } from "react";
import { message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const uploadProps = {
  showUploadList: { showPreviewIcon: false },
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

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
  };

  return (
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
  );
};

UploadFile.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  defaultPreview: PropTypes.string,
};

export default UploadFile;
