import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RestOutlined } from '@ant-design/icons';
import { apiService, People, CreatePeopleRequest, UpdatePeopleRequest } from '../../services/api';

const { Panel } = Collapse;
const { Option } = Select;

interface ChildrenPageProps {}

const ChildrenPage: React.FC<ChildrenPageProps> = () => {
  const [children, setChildren] = useState<People[]>([]);
  const [deletedChildren, setDeletedChildren] = useState<People[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChild, setEditingChild] = useState<People | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChildren();
    fetchDeletedChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPeopleByType('children');
      if (response.data) {
        setChildren(response.data.filter(person => !person.deleted));
      }
    } catch (error) {
      message.error('Failed to fetch children');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedChildren = async () => {
    try {
      const response = await apiService.getDeletedPeople();
      if (response.data) {
        setDeletedChildren(response.data.filter(person => person.type === 'children'));
      }
    } catch (error) {
      message.error('Failed to fetch deleted children');
    }
  };

  const handleCreate = () => {
    setEditingChild(null);
    form.resetFields();
    form.setFieldsValue({ type: 'children' });
    setModalVisible(true);
  };

  const handleEdit = (child: People) => {
    setEditingChild(child);
    form.setFieldsValue(child);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingChild) {
        const updateData: UpdatePeopleRequest = { ...values };
        const response = await apiService.updatePeople(editingChild.id, updateData);
        if (response.data) {
          setChildren(children.map(c => c.id === editingChild.id ? response.data! : c));
          message.success('Child updated successfully');
        }
      } else {
        const createData: CreatePeopleRequest = { ...values, type: 'children' };
        const response = await apiService.createPeople(createData);
        if (response.data) {
          setChildren([...children, response.data]);
          message.success('Child created successfully');
        }
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save child');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deletePeople(id);
      const deletedChild = children.find(c => c.id === id);
      if (deletedChild) {
        setChildren(children.filter(c => c.id !== id));
        setDeletedChildren([...deletedChildren, { ...deletedChild, deleted: true }]);
        message.success('Child deleted successfully');
      }
    } catch (error) {
      message.error('Failed to delete child');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await apiService.restorePeople(id);
      if (response.data) {
        setDeletedChildren(deletedChildren.filter(c => c.id !== id));
        setChildren([...children, { ...response.data, deleted: false }]);
        message.success('Child restored successfully');
      }
    } catch (error) {
      message.error('Failed to restore child');
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await apiService.hardDeletePeople(id);
      setDeletedChildren(deletedChildren.filter(c => c.id !== id));
      message.success('Child permanently deleted');
    } catch (error) {
      message.error('Failed to permanently delete child');
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
            title="Are you sure you want to delete this child?"
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
            title="Are you sure you want to permanently delete this child?"
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
        title="Children"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Child
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={children}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {deletedChildren.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Collapse>
            <Panel header={`Deleted Children (${deletedChildren.length})`} key="deleted">
              <Table
                columns={deletedColumns}
                dataSource={deletedChildren}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Panel>
          </Collapse>
        </Card>
      )}

      <Modal
        title={editingChild ? 'Edit Child' : 'Add Child'}
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
            <Input placeholder="Enter child name" />
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
          >
            <InputNumber
              placeholder="Enter age"
              min={1}
              max={18}
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
                {editingChild ? 'Update' : 'Create'}
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

export default ChildrenPage;