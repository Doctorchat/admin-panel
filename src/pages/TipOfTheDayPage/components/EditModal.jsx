import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  PageHeader,
  message,
  Modal,
  Table,
  Avatar,
  Space,
  Select,
  DatePicker,
  Popconfirm,
} from "antd";

import api from "../../../utils/appApi";
import { UploadFile } from "../../../components";
import { useMutation, useQuery, useQueryClient } from "react-query";
import TextEditor from "../../../components/TextEditor";
import moment from "moment";
import { useToggle } from "react-use";
import { QUERY_KEYS } from "../../../utils/queryKeys";
import PropTypes from "prop-types";
import { DoctorSelect } from "./DoctorSelect";

export const EditModal = ({ id, onClose }) => {
  const queryClient = useQueryClient();
  const [showModal, toggleModal] = useToggle(false);

  const { data: totd, refetch } = useQuery({
    queryKey: [QUERY_KEYS.TIP_OF_THE_DAY, id],
    queryFn: () => api.tipOfTheDay.getById(id),
    enabled: !!id,
  });

  const updateTotd = useMutation({
    mutationFn: api.tipOfTheDay.update,
  });

  useEffect(() => {
    if (id) {
      toggleModal(true);
    }
  }, [id]);

  const [form] = Form.useForm();

  const onFormSubmit = useCallback(
    async (values) => {
      if (!id) return;

      const { image, created_by, status, ...restValues } = values;
      let upload_id = totd?.data?.image_id || totd?.data?.image?.id;

      try {
        // Only upload new image if it has originFileObj (means it's a new file)
        if (image && image[0] && image[0].originFileObj) {
          const { data } = await api.upload.file(image[0].originFileObj);
          upload_id = data?.data?.id;
        }

        updateTotd.mutate(
          {
            id,
            data: {
              upload_id,
              created_by: created_by || null,
              status: status ?? totd?.data?.status,
              ...restValues,
            },
          },
          {
            onSuccess: () => {
              // Invalidate all TIP_OF_THE_DAY queries to ensure fresh data
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
              
              // Explicitly refetch current item data to ensure the modal shows updated data
              refetch();
              
              message.success("Sfatul zilei actualizat cu succes!");
              
              // Only close after successful refetch
              setTimeout(() => {
                handleCloseModal();
              }, 300);
            },

            onError: (err) => {
              console.error("Error updating tip of the day:", err);
              message.error("A apărut o eroare la actualizare de sfatul zilei.");
            },
          }
        );
      } catch (error) {
        console.error("Error in submit handler:", error);
        message.error("A apărut o eroare la actualizare de sfatul zilei.");
      }
    },
    [id, totd, queryClient, handleCloseModal, updateTotd, refetch]
  );

  function handleCloseModal() {
    toggleModal(false);
    form.resetFields();
    onClose();
  }

  useEffect(() => {
    if (totd?.data) {
      // For edit mode, we leave the image field empty at first
      // The current image is displayed separately, and this field is only for uploading a new one
      form.setFields([
        { name: "title", value: totd?.data?.title },
        { name: "content", value: totd?.data?.content },
        { name: "created_by", value: totd?.data?.created_by?.id },
        { name: "status", value: totd?.data?.status },
        { name: "image", value: [] }, // Empty fileList for new image uploads
      ]);
    }
  }, [totd, form]);

  return (
    <Modal
      title={
        <div className="tw-flex tw-items-center tw-gap-2">
          <span className="tw-text-xl">✏️ Editare sfatul zilei #{id}</span>
        </div>
      }
      open={showModal}
      onOk={form.submit}
      onCancel={handleCloseModal}
      confirmLoading={updateTotd?.isLoading}
      width={800}
      okText="Salvează"
      cancelText="Anulează"
      centered
      bodyStyle={{ padding: '24px' }}
      className="totd-edit-modal"
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFormSubmit}
        onValuesChange={(changedValues) => {
          if (changedValues.content !== undefined) {
            form.setFieldsValue({ content: changedValues.content });
          }
        }}
        requiredMark="optional"
      >
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
          <div>
            <h3 className="tw-text-gray-500 tw-mb-4 tw-font-medium tw-text-sm tw-uppercase">Conținut principal</h3>
            
            <Form.Item 
              name="title" 
              label={<span className="tw-font-medium">Titlu <span className="tw-text-red-500">*</span></span>} 
              rules={[{ required: true, message: "Vă rugăm să introduceți un titlu!" }]}
              extra="Un titlu scurt și descriptiv. Max. 100 caractere recomandat."
            >
              <Input placeholder="Introduceți titlul sfatului" maxLength={100} showCount />
            </Form.Item>

            <Form.Item
              name="content"
              label={<span className="tw-font-medium">Conținut <span className="tw-text-red-500">*</span></span>}
              rules={[{ required: true, message: "Vă rugăm să introduceți conținutul!" }]}
              getValueProps={(value) => ({ value })}
              tooltip="Folosiți formatarea pentru a crea un conținut ușor de citit"
              extra="Scrieți un conținut informativ, concis și util. Includeți surse credibile dacă este cazul."
            >
              <TextEditor style={{ minHeight: "450px" }} />
            </Form.Item>
          </div>

          <div>
            <h3 className="tw-text-gray-500 tw-mb-4 tw-font-medium tw-text-sm tw-uppercase">Setări și opțiuni</h3>
            
            <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-mb-4">
              <div className="tw-flex tw-justify-between tw-items-start">
                <h4 className="tw-text-gray-700 tw-font-medium tw-mb-3">Imagine existentă</h4>
              </div>
              
              <div className="tw-mb-4">
                <div className="tw-overflow-hidden tw-rounded-lg tw-w-full tw-h-[100px] tw-bg-gray-100 tw-mb-2 tw-relative tw-border tw-border-gray-200">
                  {totd?.data?.image ? (
                    <>
                      <img 
                        src={totd?.data?.image} 
                        alt="Imagine curentă" 
                        className="tw-w-full tw-h-full tw-object-contain"
                      />
                      <div className="tw-absolute tw-top-2 tw-right-2">
                        <div className="tw-bg-indigo-100 tw-text-indigo-800 tw-text-xs tw-px-2 tw-py-1 tw-rounded-md tw-shadow-sm">
                          Imagine curentă
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="tw-flex tw-items-center tw-justify-center tw-h-full tw-text-gray-400">
                      Nu există imagine
                    </div>
                  )}
                </div>
                <div className="tw-flex tw-justify-between tw-items-center">
                  <div className="tw-text-xs tw-text-gray-500">Imaginea curentă folosită pentru acest sfat</div>
                  <div 
                    className="tw-text-xs tw-text-indigo-600 tw-cursor-pointer hover:tw-text-indigo-800 tw-transition-colors"
                    onClick={() => {
                      if (totd?.data?.image) {
                        // Open image in a new tab for better viewing
                        window.open(totd.data.image, '_blank');
                      }
                    }}
                  >
                    {totd?.data?.image && "Vizualizează în mărime completă"}
                  </div>
                </div>
              </div>
            </div>
            
            <Form.Item
              name="image"
              label={<span className="tw-font-medium">Încarcă imagine nouă</span>}
              valuePropName="fileList"
              extra="Opțional: Încarcă o imagine nouă doar dacă dorești să o înlocuiești pe cea existentă"
            >
              <UploadFile />
            </Form.Item>
            
            <Form.Item 
              name="status" 
              label={<span className="tw-font-medium">Status <span className="tw-text-red-500">*</span></span>} 
              initialValue={totd?.data?.status}
              tooltip="Activați sau dezactivați vizibilitatea sfatului în aplicație"
            >
              <Select
                options={[
                  { value: 1, label: 'Activ', className: 'tw-text-green-600' },
                  { value: 0, label: 'Inactiv', className: 'tw-text-gray-500' },
                ]}
              />
            </Form.Item>

            <Form.Item 
              name="created_by" 
              label={<span className="tw-font-medium">Atribuit doctorului</span>} 
              tooltip="Selectați doctorul căruia îi va fi atribuit acest sfat sau ștergeți pentru a anula atribuirea"
              extra="Opțional: Puteți șterge valoarea pentru a nu atribui sfatul niciunui doctor"
            >
              <DoctorSelect defaultOption={totd?.data?.created_by} />
            </Form.Item>
            
            <div className="tw-bg-blue-50 tw-p-4 tw-rounded-md tw-mb-4">
              <div className="tw-flex tw-items-start">
                <div className="tw-text-blue-500 tw-mr-2 tw-flex-shrink-0">⏱️</div>
                <div>
                  <div className="tw-font-medium tw-mb-1 tw-text-blue-700">Data și ora publicării:</div>
                  <div className="tw-text-blue-800 tw-font-semibold">
                    {totd?.data?.created_at ? moment.utc(totd?.data?.created_at).format("DD MMMM YYYY, HH:mm") : "Nu este disponibilă"}
                  </div>
                  <div className="tw-mt-1 tw-text-xs tw-text-blue-600">
                    Această valoare a fost setată automat la momentul creării și nu poate fi modificată.
                  </div>
                </div>
              </div>
            </div>

            <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md tw-mb-4">
              <div className="tw-flex tw-items-start">
                <div className="tw-text-amber-500 tw-mr-2 tw-flex-shrink-0">ℹ️</div>
                <div>
                  <div className="tw-font-medium tw-mb-1 tw-text-gray-700">Informații importante:</div>
                  <ul className="tw-pl-4 tw-list-disc tw-text-gray-600 tw-text-sm">
                    <li className="tw-mb-1">Câmpurile marcate cu <span className="tw-text-red-500">*</span> sunt obligatorii</li>
                    <li>Sfaturile active vor fi afișate în aplicație pentru utilizatori</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-mt-6 tw-border-t tw-pt-4 tw-flex tw-justify-between tw-items-center">
          <div className="tw-text-gray-500 tw-text-sm">
            Ultima actualizare: {totd?.data?.updated_at ? moment.utc(totd?.data?.updated_at).format("DD MMMM YYYY, HH:mm") : ""}
          </div>
          
          <div className="tw-flex">
            <Button onClick={handleCloseModal} className="tw-mr-2">
              Anulează
            </Button>
            <Button 
              type="primary" 
              onClick={form.submit}
              loading={updateTotd?.isLoading}
              className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600"
            >
              Salvează modificările
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

EditModal.propTypes = {
  id: PropTypes.number,
  onClose: PropTypes.func,
};
