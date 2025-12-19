import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import client from '@/api/client.js';
import { buildDateRangePayload } from '@/utils/time.js';
import RichTextEditor from '@/components/RichTextEditor.jsx';

const { RangePicker } = DatePicker;

const NewsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ tagId: null, dateRange: [], name: '' });
  const [tags, setTags] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cover, setCover] = useState('');
  const [content, setContent] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.tagId, filters.dateRange, filters.name]);

  const fetchTags = async () => {
    const { data } = await client.post('/tags/query', { current: 1, size: 100 });
    if (data.code === 200) {
      setTags([{ id: null, name: 'all' }, ...data.data]);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = buildDateRangePayload(filters.dateRange);
      const payload = {
        current: pagination.current,
        size: pagination.pageSize,
        tagId: filters.tagId || undefined,
        name: filters.name || undefined,
        startTime,
        endTime,
      };
      const { data } = await client.post('/news/query', payload);
      if (data.code === 200) {
        setTableData(data.data);
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await client.post('/file/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.code === 200) {
          setCover(data.data);
          message.success('cover upload success');
          onSuccess(data, file);
        } else {
          throw new Error(data.msg || 'upload failed');
        }
      } catch (error) {
        message.error(error.message || 'upload failed');
        onError(error);
      }
    },
  };

  const handleTableChange = pag => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const openModal = record => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        name: record.name,
        tagId: record.tagId,
        isTop: record.isTop,
      });
      setCover(record.cover || '');
      setContent(record.content || '');
    } else {
      form.setFieldsValue({
        name: '',
        tagId: null,
        isTop: false,
      });
      setCover('');
      setContent('');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        cover,
        content,
      };
      if (!content) {
        message.error('content required');
        return;
      }
      if (editing) {
        payload.id = editing.id;
        await client.put('/news/update', payload);
        message.success('news updated');
      } else {
        await client.post('/news/save', payload);
        message.success('news added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchNews();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.message || 'operation failed');
    }
  };

  const handleDelete = async ids => {
    await client.post('/news/batchDelete', ids);
    message.success('news deleted');
    fetchNews();
  };

  const columns = [
    {
      title: 'cover',
      dataIndex: 'cover',
      render: url => <img src={url} alt="cover" style={{ width: 60, borderRadius: 6 }} />,
    },
    { title: 'category', dataIndex: 'tagName' },
    {
      title: 'recommend',
      dataIndex: 'isTop',
      render: val => (val ? 'recommend' : 'not recommend'),
    },
    { title: 'publish time', dataIndex: 'createTime' },
    { title: 'title', dataIndex: 'name' },
    {
      title: 'operation',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            edit
          </Button>
          <Popconfirm title="delete news?" onConfirm={() => handleDelete([record.id])}>
            <Button type="link" danger>
              delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="news manage"
      extra={
        <Space>
          {selectedRowKeys.length ? (
            <Popconfirm title="delete selected?" onConfirm={() => handleDelete(selectedRowKeys)}>
              <Button danger>batch delete</Button>
            </Popconfirm>
          ) : null}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            add news
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="news category"
          value={filters.tagId}
          options={tags.map(tag => ({ label: tag.name, value: tag.id }))}
          style={{ width: 180 }}
          onChange={value => {
            setFilters(prev => ({ ...prev, tagId: value }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        />
        <RangePicker
          value={filters.dateRange}
          onChange={range => {
            setFilters(prev => ({ ...prev, dateRange: range }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
        />
        <Input
          placeholder="title"
          value={filters.name}
          onChange={e => {
            setFilters(prev => ({ ...prev, name: e.target.value }));
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 220 }}
        />
        <Button onClick={() => setFilters({ tagId: null, dateRange: [], name: '' })}>reset</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'edit news' : 'add news'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="cover">
            <Upload {...uploadProps}>
              <Button>upload</Button>
            </Upload>
            {cover ? (
              <img src={cover} alt="cover" style={{ marginTop: 12, width: 200, borderRadius: 12 }} />
            ) : null}
          </Form.Item>
          <Form.Item
            label="title"
            name="name"
            rules={[{ required: true, message: 'please input title' }]}
          >
            <Input placeholder="input" />
          </Form.Item>
          <Form.Item label="category" name="tagId" rules={[{ required: true, message: 'select category' }]}>
            <Radio.Group>
              {tags
                .filter(tag => tag.id !== null)
                .map(tag => (
                  <Radio key={tag.id} value={tag.id} style={{ display: 'block', marginBottom: 6 }}>
                    {tag.name}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="recommend" name="isTop" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="content">
            <RichTextEditor value={content} onChange={setContent} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default NewsManagement;
