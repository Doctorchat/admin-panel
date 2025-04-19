import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  PageHeader,
  message,
  Modal,
  Avatar,
  Space,
  Select,
  DatePicker,
  Popconfirm,
  Tag,
  Tooltip,
  Badge,
} from "antd";

import api from "../../utils/appApi";
import { DcTable, UploadFile } from "../../components";
import { useMutation, useQuery, useQueryClient } from "react-query";
import TextEditor from "../../components/TextEditor";
import moment from "moment";
import { useSessionStorage, useToggle } from "react-use";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { EditModal } from "./components/EditModal";
import { DoctorSelect } from "./components/DoctorSelect";

const TipOfTheDayPage = () => {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useSessionStorage("totd-current-page", 1);
  const [showModal, toggleModal] = useToggle(false);
  const [selectedRowData, setSelectedRowData] = useState();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const [searchParams, setSearchParams] = useState({
    title: "",
    author: "",
    status: null,
  });

  // Use URLSearchParams to sync with URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const titleParam = urlParams.get('title');
    const authorParam = urlParams.get('author');
    const statusParam = urlParams.get('status');
    
    // Update state with URL params if present
    if (titleParam || authorParam || statusParam) {
      const newParams = {
        title: titleParam || "",
        author: authorParam || "",
        status: statusParam ? parseInt(statusParam, 10) : null,
      };
      setSearchParams(newParams);
      setSearchText(titleParam || authorParam || "");
      setStatusFilter(statusParam ? parseInt(statusParam, 10) : null);
    }
  }, []);
  
  // Function to update URL with search params
  const updateUrlParams = useCallback((params) => {
    const urlParams = new URLSearchParams();
    
    if (params.title && params.title.trim() !== '') urlParams.set('title', params.title);
    if (params.author && params.author.trim() !== '') urlParams.set('author', params.author);
    if (params.status !== null && params.status !== undefined) urlParams.set('status', params.status);
    
    const newUrl = 
      window.location.pathname + 
      (urlParams.toString() ? `?${urlParams.toString()}` : '');
    
    window.history.pushState({}, '', newUrl);
  }, []);

  const { data: totd, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.TIP_OF_THE_DAY, currentPage, searchParams],
    queryFn: () => api.tipOfTheDay.getAll({
      page: currentPage,
      title: searchParams.title,
      author: searchParams.author,
      status: searchParams.status,
    }),
  });

  const createTotd = useMutation({
    mutationFn: api.tipOfTheDay.create,
    onSuccess: () => {
      // Force refetch to update the UI immediately
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
      // No need for explicit message here as it's handled in form submit
    },
  });

  const deleteTotd = useMutation({
    mutationFn: api.tipOfTheDay.delete,
    onSuccess: () => {
      // Force refetch to update the UI immediately
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIP_OF_THE_DAY] });
      // Show success message
      message.success("Sfatul zilei a fost șters cu succes!");
    },
    onError: (error) => {
      console.error("Error deleting tip of the day:", error);
      message.error("A apărut o eroare la ștergerea sfatului zilei.");
    }
  });

  const [form] = Form.useForm();

  const onFormSubmit = useCallback(
    async (values) => {
      const { image, created_by, status, ...restValues } = values;
      let upload_id = null;

      try {
        if (!image || !image[0]?.originFileObj) {
          message.error("Imaginea este obligatorie!");
          return;
        }

        const { data } = await api.upload.file(image[0]?.originFileObj);
        upload_id = data?.data?.id;

        createTotd.mutate({
          upload_id,
          created_by: created_by || null,
          status: status ?? 1,
          ...restValues,
        }, {
          onSuccess: () => {
            message.success("Sfatul zilei a fost creat cu succes!");
            form.resetFields();
            toggleModal();
          },
          onError: (error) => {
            console.error("Error creating tip of the day:", error);
            message.error("A apărut o eroare la crearea sfatului zilei.");
          }
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("A apărut o eroare la încărcarea imaginii.");
      }
    },
    [form, createTotd, toggleModal]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        width: 60,
        render: (id) => (
          <div className="tw-text-gray-500 tw-text-sm">#{id}</div>
        ),
      },
      {
        title: "Titlu",
        dataIndex: "title",
        render: (title) => (
          <Tooltip title={title}>
            <div className="tw-font-medium tw-truncate tw-max-w-xs tw-text-indigo-800 dark:tw-text-indigo-300 hover:tw-text-purple-700 dark:hover:tw-text-purple-300 tw-cursor-pointer tw-transition-colors">
              {title}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Creat de",
        dataIndex: "created_by",
        render: (_, { created_by }) =>
          created_by ? (
            <div className="tw-flex tw-items-center tw-gap-2">
              <div className="tw-relative">
                <Avatar 
                  src={created_by?.avatar} 
                  className="tw-border-2 tw-border-purple-100 dark:tw-border-gray-700"
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                />
                <div className="tw-absolute tw-bottom-0 tw-right-0 tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-border tw-border-white" />
              </div>
              <div>
                <div className="tw-font-medium tw-text-sm">{created_by?.name}</div>
                <div className="tw-text-xs tw-text-gray-500">Doctor</div>
              </div>
            </div>
          ) : (
            <div className="tw-flex tw-items-center tw-gap-2">
              <Avatar className="tw-bg-gray-200 tw-text-gray-400 dark:tw-bg-gray-700 dark:tw-text-gray-500">?</Avatar>
              <span className="tw-text-gray-400 tw-text-xs">Nealocat</span>
            </div>
          ),
      },
      {
        title: "Statut",
        dataIndex: "status",
        width: 110,
        render: (_, { status }) => {
          return status === 1 ? (
            <div className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gradient-to-r tw-from-green-100 tw-to-green-50 dark:tw-from-green-900/30 dark:tw-to-green-800/30 tw-text-green-800 dark:tw-text-green-400 tw-border tw-border-green-200 dark:tw-border-green-900/50">
              <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-green-500 tw-mr-1.5" />
              Activ
            </div>
          ) : (
            <div className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-50 dark:tw-from-gray-800/30 dark:tw-to-gray-700/30 tw-text-gray-700 dark:tw-text-gray-400 tw-border tw-border-gray-200 dark:tw-border-gray-700/50">
              <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-gray-400 tw-mr-1.5" />
              Inactiv
            </div>
          );
        },
        filters: [
          { text: 'Activ', value: 1 },
          { text: 'Inactiv', value: 0 },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "Data Publicării",
        dataIndex: "created_at",
        render: (created_at) => (
          <Tooltip title={moment.utc(created_at).format("DD MMMM YYYY, HH:mm")}>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-sm">{moment.utc(created_at).format("DD.MM.YYYY")}</span>
              <span className="tw-text-xs tw-text-gray-500">{moment.utc(created_at).format("HH:mm")}</span>
            </div>
          </Tooltip>
        ),
        sorter: (a, b) => moment.utc(a.created_at).unix() - moment.utc(b.created_at).unix(),
      },
      {
        title: "Vizualizări",
        dataIndex: "views_count",
        width: 120,
        render: (views_count) => (
          <div className="tw-flex tw-items-center tw-gap-1">
            <span className="tw-text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="tw-font-medium tw-text-gray-700 dark:tw-text-gray-300">
              {typeof views_count === 'number' ? views_count.toLocaleString() : '0'}
            </span>
          </div>
        ),
        sorter: (a, b) => {
          const aCount = typeof a.views_count === 'number' ? a.views_count : 0;
          const bCount = typeof b.views_count === 'number' ? b.views_count : 0;
          return aCount - bCount;
        },
      },
      {
        title: "Acțiuni",
        width: 170,
        render: (_, row) => (
          <div className="tw-flex tw-items-center tw-gap-2">
            <Button 
              type="primary" 
              size="small" 
              onClick={() => setSelectedRowData(row)}
              className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-indigo-600 tw-border-0 tw-shadow-md hover:tw-shadow-lg tw-transition-all"
              style={{ borderRadius: '6px' }}
            >
              <div className="tw-flex tw-items-center tw-gap-1">
                <span className="anticon">✏️</span>
                <span>Editează</span>
              </div>
            </Button>

            <Popconfirm
              title="Ești sigur că vrei să ștergi acest sfat?"
              placement="left"
              okText="Accept"
              cancelText="Anulează"
              onConfirm={() => deleteTotd.mutate(row.id)}
            >
              <Button 
                type="primary" 
                size="small" 
                danger
                className="tw-bg-gradient-to-r tw-from-red-500 tw-to-red-600 tw-border-0 tw-shadow-md hover:tw-shadow-lg tw-transition-all"
                style={{ borderRadius: '6px' }}
              >
                <span className="anticon">🗑️</span>
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [totd, deleteTotd]
  );

  const onTableChange = useCallback(
    (pagination, filters, sorter) => {
      setCurrentPage(pagination.current);
      
      // Handle additional filtering if needed
      if (filters.status && filters.status.length > 0) {
        const statusValue = filters.status[0];
        const newParams = { ...searchParams, status: statusValue };
        setSearchParams(newParams);
        setStatusFilter(statusValue);
        updateUrlParams(newParams);
      } else if (filters.status && filters.status.length === 0) {
        const newParams = { ...searchParams, status: null };
        setSearchParams(newParams);
        setStatusFilter(null);
        
        // Only keep non-empty parameters in URL
        const urlParams = new URLSearchParams();
        if (searchParams.title && searchParams.title.trim() !== '') urlParams.set('title', searchParams.title);
        if (searchParams.author && searchParams.author.trim() !== '') urlParams.set('author', searchParams.author);
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.pushState({}, '', newUrl);
      }
    },
    [currentPage, setCurrentPage, searchParams, updateUrlParams]
  );

  // Data is already filtered by API, use it directly
  const displayData = useMemo(() => {
    return totd?.data || [];
  }, [totd?.data]);

  // Add helper text to explain query parameters
  const searchInfo = useMemo(() => {
    const activeFilters = [];
    if (searchParams.title) activeFilters.push(`Titlu: ${searchParams.title}`);
    if (searchParams.author) activeFilters.push(`Autor: ${searchParams.author}`);
    if (searchParams.status !== null) {
      activeFilters.push(`Status: ${searchParams.status === 1 ? 'Activ' : 'Inactiv'}`);
    }
    
    if (activeFilters.length === 0) return null;
    
    return (
      <div className="tw-bg-indigo-50 dark:tw-bg-indigo-900/30 tw-p-3 tw-rounded-lg tw-mb-4 tw-text-sm tw-flex tw-items-center tw-justify-between">
        <div>
          <span className="tw-font-medium tw-text-indigo-700 dark:tw-text-indigo-300">Filtre active:</span>
          <span className="tw-ml-2 tw-text-indigo-600 dark:tw-text-indigo-400">{activeFilters.join(', ')}</span>
        </div>
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            setSearchParams({ title: "", author: "", status: null });
            setSearchText("");
            setStatusFilter(null);
            // Just reset to base URL without any parameters 
            window.history.pushState({}, '', window.location.pathname);
          }}
          className="tw-text-red-500 hover:tw-text-red-700 dark:tw-text-red-400 dark:hover:tw-text-red-300"
        >
          Resetează filtrele
        </Button>
      </div>
    );
  }, [searchParams, updateUrlParams]);

  return (
    <>
      <div className="tw-bg-gradient-to-r tw-from-indigo-900/90 tw-via-purple-800/90 tw-to-indigo-900/90 tw-rounded-xl tw-mb-8 tw-shadow-lg tw-overflow-hidden">
        <div className="tw-p-6 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4">
          <div className="tw-flex tw-items-center">
            <div className="tw-bg-white/10 tw-p-2 tw-rounded-lg tw-mr-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tw-text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="tw-text-2xl tw-font-bold tw-text-white tw-tracking-wide">Sfatul Zilei</h1>
              <p className="tw-text-blue-100/80 tw-text-sm tw-mt-1">Administrare sfaturi medicale pentru utilizatori</p>
            </div>
          </div>
          <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap md:tw-flex-nowrap tw-w-full md:tw-w-auto">
            <div className="tw-relative tw-w-full md:tw-w-auto">
              <Input.Search
                placeholder="Caută după titlu"
                allowClear
                className="tw-min-w-[250px] tw-flex-grow md:tw-flex-grow-0"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onSearch={value => {
                  let newParams;
                  if (!value.trim()) {
                    // If search is empty, clear search params
                    newParams = { ...searchParams, title: "", author: "" };
                    // Just reset to pathname with status param if exists
                    const urlParams = new URLSearchParams();
                    if (searchParams.status !== null) urlParams.set('status', searchParams.status);
                    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
                    window.history.pushState({}, '', newUrl);
                  } else if (value.toLowerCase().startsWith("autor:")) {
                    const author = value.substring(6).trim();
                    newParams = { ...searchParams, author, title: "" };
                    updateUrlParams(newParams);
                  } else {
                    newParams = { ...searchParams, title: value, author: "" };
                    updateUrlParams(newParams);
                  }
                  setSearchParams(newParams);
                }}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <Button 
              type="primary" 
              onClick={toggleModal}
              icon={<span className="anticon">✨</span>}
              className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-purple-600 tw-border-0 tw-h-10 tw-shadow-md tw-px-6"
              style={{ borderRadius: '8px' }}
            >
              Adaugă sfat nou
            </Button>
          </div>
        </div>

        <div className="tw-bg-gradient-to-b tw-from-indigo-900/20 tw-to-blue-900/40 tw-px-6 tw-py-3 tw-border-t tw-border-white/10 tw-flex tw-justify-between tw-items-center">
          <div className="tw-text-white/70 tw-text-sm">
            {totd?.meta?.total ? 
              <span>
                <span className="tw-text-white tw-font-medium">{totd.meta.total}</span> sfaturi în total
              </span> 
              : 'Nu există sfaturi'
            }
          </div>
          <div className="tw-flex tw-items-center">
            <span className="tw-mr-2 tw-text-white/70 tw-text-sm">Filtrează:</span>
            <Select 
              style={{ width: 130, borderRadius: '6px' }}
              placeholder="Toate"
              allowClear
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                const newParams = { ...searchParams, status: value };
                setSearchParams(newParams);
                
                // Only update URL if there are actual parameters
                if (value === undefined || value === null) {
                  const urlParams = new URLSearchParams();
                  if (searchParams.title && searchParams.title.trim() !== '') urlParams.set('title', searchParams.title);
                  if (searchParams.author && searchParams.author.trim() !== '') urlParams.set('author', searchParams.author);
                  const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
                  window.history.pushState({}, '', newUrl);
                } else {
                  updateUrlParams(newParams);
                }
              }}
              options={[
                { value: 1, label: 'Activ', className: 'tw-text-green-600' },
                { value: 0, label: 'Inactiv', className: 'tw-text-gray-500' },
              ]}
              dropdownStyle={{ borderRadius: '8px' }}
              className="tw-rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="tw-bg-white/80 dark:tw-bg-gray-900/90 tw-backdrop-blur-sm tw-p-6 tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100 dark:tw-border-gray-800 tw-mb-6">
        {searchInfo}
        
        <DcTable
          rowKey="id"
          dataColumns={columns}
          dataSource={displayData}
          loading={isLoading}
          onTabelChange={onTableChange}
          pagination={{
            per_page: totd?.meta?.per_page,
            total: totd?.meta?.total,
            current_page: totd?.meta?.current_page,
          }}
          rowClassName="tw-hover:tw-bg-gradient-to-r hover:tw-from-blue-50 hover:tw-to-purple-50/30 dark:hover:tw-from-gray-800/50 dark:hover:tw-to-gray-800/30"
        />
      </div>

      <Modal 
        title={null}
        open={showModal} 
        onCancel={toggleModal}
        width={1100}
        footer={null}
        centered
        bodyStyle={{ padding: 0 }}
        className="totd-create-modal"
        style={{ overflow: 'hidden' }}
        closeIcon={null}
      >
        <div className="tw-flex tw-flex-col md:tw-flex-row">
          <div className="tw-bg-gradient-to-br tw-from-indigo-800 tw-via-purple-800 tw-to-indigo-700 tw-p-8 md:tw-w-1/3 tw-text-white">
            <div className="tw-mb-8">
              <span className="tw-bg-white/10 tw-p-3 tw-rounded-lg tw-inline-block">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tw-text-white">
                  <path d="M20 2H4C3 2 2 2.9 2 4V7.01C2 7.73 2.43 8.35 3 8.7V20C3 21.1 4.1 22 5 22H19C19.9 22 21 21.1 21 20V8.7C21.57 8.35 22 7.73 22 7.01V4C22 2.9 21 2 20 2ZM19 20H5V9H19V20ZM20 7H4V4H20V7Z" fill="currentColor"/>
                  <path d="M13 11H16V13H13V11Z" fill="currentColor"/>
                  <path d="M8 11H11V13H8V11Z" fill="currentColor"/>
                  <path d="M13 15H16V17H13V15Z" fill="currentColor"/>
                  <path d="M8 15H11V17H8V15Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <h2 className="tw-text-2xl tw-font-bold tw-mb-3 text-white">Creează un sfat nou</h2>
            <p className="tw-text-blue-100/90 tw-mb-6">
              Adaugă sfaturi medicale informative care vor fi afișate utilizatorilor în aplicație. 
              Sfaturile bine redactate și cu imagini atractive cresc angajamentul utilizatorilor.
            </p>
            
            <div className="tw-bg-white/10 tw-rounded-lg tw-p-4 tw-backdrop-blur-sm">
              <h3 className="tw-font-medium tw-mb-2 text-white">Recomandări:</h3>
              <ul className="tw-list-disc tw-pl-5 tw-space-y-1 tw-text-sm tw-text-blue-100/80">
                <li>Titluri scurte, clare și captivante</li>
                <li>Imagini relevante, de înaltă calitate</li>
                <li>Conținut structurat, clar și succint</li>
                <li>Informații bazate pe surse medicale credibile</li>
              </ul>
            </div>
          </div>
          
          <div className="md:tw-w-2/3 tw-p-6 tw-bg-white tw-overflow-auto"
               style={{ maxHeight: 'calc(100vh - 100px)' }}>
            <div className="tw-mb-6">
              <h2 className="tw-text-xl tw-font-semibold tw-text-gray-800">✨ Adaugă sfatul zilei</h2>
            </div>
        
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
              
              <Form.Item 
                name="image" 
                label={<span className="tw-font-medium">Imagine <span className="tw-text-red-500">*</span></span>} 
                rules={[{ required: true, message: "Vă rugăm să încărcați o imagine!" }]} 
                valuePropName="fileList"
                extra="Imaginea va fi afișată alături de text. Format recomandat: 16:9"
              >
                <UploadFile />
              </Form.Item>
              
              <Form.Item 
                name="status" 
                label={<span className="tw-font-medium">Status <span className="tw-text-red-500">*</span></span>} 
                initialValue={1}
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
                <DoctorSelect />
              </Form.Item>

              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md tw-mb-4">
                <div className="tw-flex tw-items-start">
                  <div className="tw-text-amber-500 tw-mr-2 tw-flex-shrink-0">ℹ️</div>
                  <div>
                    <div className="tw-font-medium tw-mb-1 tw-text-gray-700">Informații importante:</div>
                    <ul className="tw-pl-4 tw-list-disc tw-text-gray-600 tw-text-sm">
                      <li className="tw-mb-1">Câmpurile marcate cu <span className="tw-text-red-500">*</span> sunt obligatorii</li>
                      <li className="tw-mb-1">Data și ora publicării vor fi setate automat la momentul creării</li>
                      <li>Sfaturile active vor fi afișate în aplicație pentru utilizatori</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-mt-6 tw-border-t tw-pt-4 tw-flex tw-justify-end">
            <Button 
              onClick={toggleModal} 
              className="tw-mr-2 tw-border-gray-300 hover:tw-bg-gray-50 tw-transition-colors"
            >
              Anulează
            </Button>
            <Button 
              type="primary" 
              onClick={form.submit}
              className="tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-border-0"
              style={{ borderRadius: '6px' }}
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                </svg>
                <span>Salvează sfatul</span>
              </div>
            </Button>
          </div>
        </Form>
          </div>
        </div>
      </Modal>

      <EditModal 
        id={selectedRowData?.id} 
        onClose={() => {
          setSelectedRowData(null);
          // Ensure data is refreshed when modal is closed
          refetch();
        }} 
      />
    </>
  );
};

export default TipOfTheDayPage;
