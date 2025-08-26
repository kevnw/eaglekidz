import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Collapse, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RestOutlined, SearchOutlined } from '@ant-design/icons';
import { apiService, People, CreatePeopleRequest, UpdatePeopleRequest } from '../../services/api';

const { Panel } = Collapse;
const { Option } = Select;

interface MinistersPageProps {}

const MinistersPage: React.FC<MinistersPageProps> = () => {
  const [ministers, setMinisters] = useState<People[]>([]);
  const [deletedMinisters, setDeletedMinisters] = useState<People[]>([]);
  const [filteredMinisters, setFilteredMinisters] = useState<People[]>([]);
  const [filteredDeletedMinisters, setFilteredDeletedMinisters] = useState<People[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMinister, setEditingMinister] = useState<People | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMinisters();
    fetchDeletedMinisters();
  }, []);

  // Filter ministers based on search and filter criteria
  useEffect(() => {
    let filtered = ministers.filter(minister => {
      const fullName = `${minister.first_name} ${minister.last_name}`.toLowerCase();
      const matchesSearch = searchText === '' || 
        fullName.includes(searchText.toLowerCase()) ||
        minister.phone?.includes(searchText);
      
      const matchesAgeGroup = selectedAgeGroups.length === 0 || 
        (minister.age_group && minister.age_group.some(group => selectedAgeGroups.includes(group)));
      
      const matchesRoles = selectedRoles.length === 0 || 
        (minister.roles && minister.roles.some(role => selectedRoles.includes(role)));
      
      return matchesSearch && matchesAgeGroup && matchesRoles;
    });
    setFilteredMinisters(filtered);
  }, [ministers, searchText, selectedAgeGroups, selectedRoles]);

  // Filter deleted ministers
  useEffect(() => {
    let filtered = deletedMinisters.filter(minister => {
      const fullName = `${minister.first_name} ${minister.last_name}`.toLowerCase();
      const matchesSearch = searchText === '' || 
        fullName.includes(searchText.toLowerCase()) ||
        minister.phone?.includes(searchText);
      
      const matchesAgeGroup = selectedAgeGroups.length === 0 || 
        (minister.age_group && minister.age_group.some(group => selectedAgeGroups.includes(group)));
      
      const matchesRoles = selectedRoles.length === 0 || 
        (minister.roles && minister.roles.some(role => selectedRoles.includes(role)));
      
      return matchesSearch && matchesAgeGroup && matchesRoles;
    });
    setFilteredDeletedMinisters(filtered);
  }, [deletedMinisters, searchText, selectedAgeGroups, selectedRoles]);

  const fetchMinisters = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPeopleByType('minister');
      if (response.data) {
        const activeMinisters = response.data.filter(person => !person.deleted);
        setMinisters(activeMinisters);
        setFilteredMinisters(activeMinisters);
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
        const deletedMinistersList = response.data.filter(person => person.type === 'minister');
        setDeletedMinisters(deletedMinistersList);
        setFilteredDeletedMinisters(deletedMinistersList);
      }
    } catch (error) {
      message.error('Failed to fetch deleted ministers');
    }
  };

  const handleCreate = () => {
    setEditingMinister(null);
    form.resetFields();
    form.setFieldsValue({ 
      type: 'minister',
      phone: { country_code: '+65', number: '' }
    });
    setModalVisible(true);
  };

  const handleEdit = (minister: People) => {
    setEditingMinister(minister);
    // Parse existing phone number if it exists
    let phoneData = { country_code: '+65', number: '' };
    if (minister.phone) {
      // Try to extract country code from existing phone
      const phoneMatch = minister.phone.match(/^(\+\d{1,4})\s*(.+)$/);
      if (phoneMatch) {
        phoneData = {
          country_code: phoneMatch[1],
          number: phoneMatch[2]
        };
      } else {
        phoneData.number = minister.phone;
      }
    }
    
    form.setFieldsValue({
      ...minister,
      phone: phoneData
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Combine country code and phone number
      const formattedValues = {
        ...values,
        phone: values.phone ? `${values.phone.country_code} ${values.phone.number}` : ''
      };
      
      if (editingMinister) {
        const updateData: UpdatePeopleRequest = { ...formattedValues };
        const response = await apiService.updatePeople(editingMinister.id, updateData);
        if (response.data) {
          setMinisters(ministers.map(m => m.id === editingMinister.id ? response.data! : m));
          message.success('Minister updated successfully');
        }
      } else {
        const createData: CreatePeopleRequest = { ...formattedValues, type: 'minister' };
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
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a: People, b: People) => a.first_name.localeCompare(b.first_name),
      sortDirections: ['ascend' as const, 'descend' as const],
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Age Group',
      dataIndex: 'age_group',
      key: 'age_group',
      render: (ageGroups: string[]) => (
        <div>
          {ageGroups && ageGroups.map((group, index) => (
            <span key={index} style={{ 
              display: 'inline-block', 
              background: '#f0f0f0', 
              padding: '2px 8px', 
              margin: '2px', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {group}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => {
        const roleColors: { [key: string]: string } = {
          'SIC': '#ff4d4f',
          'PAW': '#52c41a',
          'Operator': '#1890ff',
          'Host': '#722ed1',
          'Usher': '#fa8c16',
          'Activity/Games': '#eb2f96'
        };
        return (
          <div>
            {roles && roles.map((role, index) => (
              <span key={index} style={{ 
                display: 'inline-block', 
                background: roleColors[role] || '#f0f0f0',
                color: 'white',
                padding: '2px 8px', 
                margin: '2px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {role}
              </span>
            ))}
          </div>
        );
      },
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
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a: People, b: People) => a.first_name.localeCompare(b.first_name),
      sortDirections: ['ascend' as const, 'descend' as const],
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Age Group',
      dataIndex: 'age_group',
      key: 'age_group',
      render: (ageGroups: string[]) => (
        <div>
          {ageGroups && ageGroups.map((group, index) => (
            <span key={index} style={{ 
              display: 'inline-block', 
              background: '#f0f0f0', 
              padding: '2px 8px', 
              margin: '2px', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {group}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => {
        const roleColors: { [key: string]: string } = {
          'SIC': '#ff4d4f',
          'PAW': '#52c41a',
          'Operator': '#1890ff',
          'Host': '#722ed1',
          'Usher': '#fa8c16',
          'Activity/Games': '#eb2f96'
        };
        return (
          <div>
            {roles && roles.map((role, index) => (
              <span key={index} style={{ 
                display: 'inline-block', 
                background: roleColors[role] || '#f0f0f0',
                color: 'white',
                padding: '2px 8px', 
                margin: '2px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {role}
              </span>
            ))}
          </div>
        );
      },
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
        {/* Search and Filter Controls */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search by name, email, or phone"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                placeholder="Filter by age group"
                value={selectedAgeGroups}
                onChange={setSelectedAgeGroups}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="Little Eagle">Little Eagle</Option>
                <Option value="All Star">All Star</Option>
                <Option value="Super Trooper">Super Trooper</Option>
                <Option value="Voltage">Voltage</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                placeholder="Filter by roles"
                value={selectedRoles}
                onChange={setSelectedRoles}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="SIC">SIC</Option>
                <Option value="PAW">PAW</Option>
                <Option value="Operator">Operator</Option>
                <Option value="Host">Host</Option>
                <Option value="Usher">Usher</Option>
                <Option value="Activity/Games">Activity/Games</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Button 
                  onClick={() => {
                    setSearchText('');
                    setSelectedAgeGroups([]);
                    setSelectedRoles([]);
                  }}
                >
                  Clear Filters
                </Button>
              </Space>
            </Col>
          </Row>
          
          {/* Results Count */}
          <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
            Showing {filteredMinisters.length} of {ministers.length} ministers
            {(searchText || selectedAgeGroups.length > 0 || selectedRoles.length > 0) && (
              <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                (filtered)
              </span>
            )}
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredMinisters}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {deletedMinisters.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Collapse>
            <Panel header={`Deleted Ministers (${filteredDeletedMinisters.length} of ${deletedMinisters.length})`} key="deleted">
              <Table
                columns={deletedColumns}
                dataSource={filteredDeletedMinisters}
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
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input.Group compact>
              <Form.Item
                name={['phone', 'country_code']}
                noStyle
                initialValue="+65"
              >
                <Select
                  style={{ width: '35%' }}
                  placeholder="Country"
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.children || '';
                    return String(label).toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  <Option value="+65">Singapore (+65)</Option>
                  <Option value="+62">Indonesia (+62)</Option>
                  <Option value="+60">Malaysia (+60)</Option>
                  <Option value="+66">Thailand (+66)</Option>
                  <Option value="+84">Vietnam (+84)</Option>
                  <Option value="+63">Philippines (+63)</Option>
                  <Option value="+1">United States (+1)</Option>
                  <Option value="+44">United Kingdom (+44)</Option>
                  <Option value="+61">Australia (+61)</Option>
                  <Option value="+81">Japan (+81)</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['phone', 'number']}
                noStyle
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input
                  style={{ width: '65%' }}
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="age_group"
            label="Age Group"
            rules={[{ required: true, message: 'Please select at least one age group' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select age groups"
              style={{ width: '100%' }}
            >
              <Option value="Little Eagle">Little Eagle</Option>
              <Option value="All Star">All Star</Option>
              <Option value="Super Trooper">Super Trooper</Option>
              <Option value="Voltage">Voltage</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="roles"
            label="Roles"
            rules={[{ required: true, message: 'Please select at least one role' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select roles"
              style={{ width: '100%' }}
            >
              <Option value="SIC">SIC</Option>
              <Option value="PAW">PAW</Option>
              <Option value="Operator">Operator</Option>
              <Option value="Host">Host</Option>
              <Option value="Usher">Usher</Option>
              <Option value="Activity/Games">Activity/Games</Option>
            </Select>
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