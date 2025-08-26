import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RestOutlined } from '@ant-design/icons';
import { apiService, People, CreatePeopleRequest, UpdatePeopleRequest } from '../../services/api';

const { Panel } = Collapse;
const { Option } = Select;

interface MinistersPageProps {}

const MinistersPage: React.FC<MinistersPageProps> = () => {
  const [ministers, setMinisters] = useState<People[]>([]);
  const [deletedMinisters, setDeletedMinisters] = useState<People[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMinister, setEditingMinister] = useState<People | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMinisters();
    fetchDeletedMinisters();
  }, []);

  const fetchMinisters = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPeopleByType('minister');
      if (response.data) {
        setMinisters(response.data.filter(person => !person.deleted));
      }
    } catch (error) {
      message.error('Failed to fetch ministers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedMinisters = async () => {
    try {
      const response = await apiService.getDeletedPeople();
      if (response.data) {
        setDeletedMinisters(response.data.filter(person => person.type === 'minister'));
      }
    } catch (error) {
      message.error('Failed to fetch deleted ministers');
    }
  };

  const handleCreate = () => {
    setEditingMinister(null);
    form.resetFields();
    form.setFieldsValue({ type: 'minister' });
    setModalVisible(true);
  };

  const handleEdit = (minister: People) => {
    setEditingMinister(minister);
    form.setFieldsValue(minister);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMinister) {
        const updateData: UpdatePeopleRequest = { ...values };
        const response = await apiService.updatePeople(editingMinister.id, updateData);
        if (response.data) {
          setMinisters(ministers.map(m => m.id === editingMinister.id ? response.data! : m));
          message.success('Minister updated successfully');
        }
      } else {
        const createData: CreatePeopleRequest = { ...values, type: 'minister' };
        const response = await apiService.createPeople(createData);
        if (response.data) {
          setMinisters([...ministers, response.data]);
          message.success('Minister created successfully');
        }
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save minister');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deletePeople(id);
      const deletedMinister = ministers.find(m => m.id === id);
      if (deletedMinister) {
        setMinisters(ministers.filter(m => m.id !== id));
        setDeletedMinisters([...deletedMinisters, { ...deletedMinister, deleted: true }]);
        message.success('Minister deleted successfully');
      }
    } catch (error) {
      message.error('Failed to delete minister');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await apiService.restorePeople(id);
      if (response.data) {
        setDeletedMinisters(deletedMinisters.filter(m => m.id !== id));
        setMinisters([...ministers, { ...response.data, deleted: false }]);
        message.success('Minister restored successfully');
      }
    } catch (error) {
      message.error('Failed to restore minister');
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await apiService.hardDeletePeople(id);
      setDeletedMinisters(deletedMinisters.filter(m => m.id !== id));
      message.success('Minister permanently deleted');
    } catch (error) {
      message.error('Failed to permanently delete minister');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: People) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this minister?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const deletedColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: People) => (
        <Space>
          <Button
            type="link"
            icon={<RestOutlined />}
            style={{ color: '#52c41a' }}
            onClick={() => handleRestore(record.id)}
          >
            Restore
          </Button>
          <Popconfirm
            title="Are you sure you want to permanently delete this minister?"
            onConfirm={() => handleHardDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete Forever
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Ministers"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Minister
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={ministers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {deletedMinisters.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Collapse>
            <Panel header={`Deleted Ministers (${deletedMinisters.length})`} key="deleted">
              <Table
                columns={deletedColumns}
                dataSource={deletedMinisters}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Panel>
          </Collapse>
        </Card>
      )}

      <Modal
        title={editingMinister ? 'Edit Minister' : 'Add Minister'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter minister name" />
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
          >
            <InputNumber
              placeholder="Enter age"
              min={1}
              max={120}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea
              placeholder="Enter additional notes"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingMinister ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MinistersPage;