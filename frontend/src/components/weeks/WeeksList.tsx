import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Alert, Spin, Empty, Row, Col, Space, Tag, Divider, Cascader, Modal, Form, Select, message } from 'antd';
import { CalendarOutlined, EyeOutlined, PlusOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { apiService, Week, Service, People } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface WeeksListProps {
  refreshTrigger?: number;
}

const WeeksList: React.FC<WeeksListProps> = ({ refreshTrigger }) => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [filteredWeeks, setFilteredWeeks] = useState<Week[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [cascaderOptions, setCascaderOptions] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Service management state
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [ministers, setMinisters] = useState<People[]>([]);
  const [serviceForm] = Form.useForm();
  const [serviceLoading, setServiceLoading] = useState(false);
  
  const navigate = useNavigate();

  const fetchWeeks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAllWeeks();
      
      if (response.data) {
        const weeksData = response.data;
        setWeeks(weeksData);
        
        // Extract unique years from weeks
        const years = Array.from(new Set(
          weeksData.map(week => new Date(week.start_time).getFullYear().toString())
        )).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
        
        // Extract all unique year-month combinations
        const yearMonthSet = new Set<string>();
        weeksData.forEach(week => {
          const date = new Date(week.start_time);
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          yearMonthSet.add(`${year}-${month}`);
        });
        
        // Create cascader options with years and months
        const options = years.map(year => {
          const monthsInYear = Array.from(yearMonthSet)
            .filter(period => period.startsWith(year + '-'))
            .sort();
            
          const children = monthsInYear.map(yearMonth => {
            const [, month] = yearMonth.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
            return {
              value: month,
              label: monthName
            };
          });
          
          return {
            value: year,
            label: year,
            children: children.length > 0 ? children : undefined
          };
        });
        
        setCascaderOptions(options);
        
        // Set current year as default if available
        const currentYear = new Date().getFullYear().toString();
        if (years.includes(currentYear)) {
          setSelectedYear(currentYear);
          setSelectedPeriod([currentYear]);
        } else if (years.length > 0) {
          setSelectedYear(years[0] as string);
          setSelectedPeriod([years[0] as string]);
        } else {
          // Reset filters when no weeks exist
          setSelectedYear('');
          setSelectedPeriod([]);
        }
        
        // Reset month selection when weeks change
        setSelectedMonth('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weeks');
    } finally {
      setLoading(false);
    }
  };



  const filterWeeks = () => {
    let filtered = weeks;

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(week => {
        const weekYear = new Date(week.start_time).getFullYear().toString();
        return weekYear === selectedYear;
      });
    }

    // Filter by month if selected
    if (selectedMonth) {
      filtered = filtered.filter(week => {
        const weekMonth = (new Date(week.start_time).getMonth() + 1).toString().padStart(2, '0');
        return weekMonth === selectedMonth;
      });
    }

    // Sort by start date (oldest first)
    filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
    setFilteredWeeks(filtered);
  };





  const handleViewReviews = (week: Week) => {
    const weekTitle = getWeekTitle(week);
    navigate(`/weeks/${week.id}/reviews`, {
      state: { weekTitle }
    });
  };

  const handleAddReview = (week: Week) => {
    const weekTitle = getWeekTitle(week);
    navigate(`/weeks/${week.id}/add-review`, {
      state: { weekTitle }
    });
  };

  const handleManageServices = (week: Week) => {
    setSelectedWeek(week);
    setServiceModalVisible(true);
    
    // Initialize form with current services or default services
    const defaultServices = [
      { name: 'Voltage', time: '11AM', sic: '' },
      { name: 'Little Eagle, All Star, Super Trooper', time: '11AM', sic: '' },
      { name: 'Little Eagle, All Star, Super Trooper', time: '1PM', sic: '' }
    ];
    
    const services = week.services && week.services.length > 0 ? week.services : defaultServices;
    serviceForm.setFieldsValue({ services });
  };

  const fetchMinisters = async () => {
    try {
      const response = await apiService.getPeopleByType('minister');
      if (response.data) {
        setMinisters(response.data.filter(minister => !minister.deleted));
      }
    } catch (error) {
      console.error('Failed to fetch ministers:', error);
    }
  };

  const handleServiceSubmit = async () => {
    if (!selectedWeek) return;
    
    try {
      setServiceLoading(true);
      const values = await serviceForm.validateFields();
      
      await apiService.updateWeekServices(selectedWeek.id, {
        services: values.services
      });
      
      message.success('Services updated successfully!');
      setServiceModalVisible(false);
      fetchWeeks(); // Refresh weeks to show updated services
    } catch (error) {
      console.error('Failed to update services:', error);
      message.error('Failed to update services. Please try again.');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleServiceCancel = () => {
    setServiceModalVisible(false);
    setSelectedWeek(null);
    serviceForm.resetFields();
  };

  const getMinisterName = (ministerId: string) => {
    const minister = ministers.find(m => m.id === ministerId);
    return minister ? `${minister.first_name} ${minister.last_name}` : 'Unassigned';
  };

  const getServiceDisplay = (services: Service[]) => {
    if (!services || services.length === 0) {
      return <Tag color="orange">Services not configured</Tag>;
    }
    
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {services.map((service, index) => (
          <div key={index} style={{ fontSize: '12px' }}>
            <Text strong>{service.name} ({service.time}):</Text>
            <br />
            <Tag color={service.sic ? 'green' : 'orange'}>
              {service.sic ? getMinisterName(service.sic) : 'Unassigned'}
            </Tag>
          </div>
        ))}
      </Space>
    );
  };

  const getWeekTitle = (week: Week) => {
    return `Week of ${formatDate(week.start_time)}`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  const getWeekDuration = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day') + 1;
    return `${diffDays} days`;
  };

  useEffect(() => {
    fetchWeeks();
    fetchMinisters();
  }, [refreshTrigger]);

  useEffect(() => {
    filterWeeks();
  }, [weeks, selectedYear, selectedMonth]);

  useEffect(() => {
    if (serviceModalVisible) {
      fetchMinisters();
    }
  }, [serviceModalVisible]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Loading weeks...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#fadb14' }} />
          Church Weeks
        </Title>
        
        <Row gutter={16} align="middle" style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Filter by Period:</Text>
            <Cascader
              style={{ width: '100%', marginTop: '4px' }}
              placeholder="All Periods"
              options={cascaderOptions}
              value={selectedPeriod}
              onChange={(value) => {
                if (!value || value.length === 0) {
                  setSelectedYear('');
                  setSelectedMonth('');
                  setSelectedPeriod([]);
                } else if (value.length === 1) {
                  // Only year selected
                  setSelectedYear(value[0]);
                  setSelectedMonth('');
                  setSelectedPeriod(value);
                } else if (value.length === 2) {
                  // Year and month selected
                  setSelectedYear(value[0]);
                  setSelectedMonth(value[1]);
                  setSelectedPeriod(value);
                }
              }}
              allowClear
              changeOnSelect
            />
          </Col>
        </Row>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {filteredWeeks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {selectedYear ? `No weeks found for ${selectedYear}` : 'No weeks found'}
            </span>
          }
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {filteredWeeks.map(week => (
              <Col key={week.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <CalendarOutlined />
                      <Text strong>Week of {formatDate(week.start_time)}</Text>
                    </Space>
                  }

                  actions={[
                    <Space key="actions" size="small" wrap style={{ justifyContent: 'center', width: '100%' }}>
                      <Button 
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewReviews(week)}
                      >
                        View Reviews
                      </Button>
                      <Button 
                        type="default"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddReview(week)}
                      >
                        Add Review
                      </Button>
                      <Button 
                        type="default"
                        size="small"
                        icon={<TeamOutlined />}
                        onClick={() => handleManageServices(week)}
                      >
                        Manage SIC
                      </Button>
                    </Space>
                  ]}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Start:</Text>
                      <br />
                      <Text>{formatDate(week.start_time)}</Text>
                    </div>
                    
                    <div>
                      <Text strong>End:</Text>
                      <br />
                      <Text>{formatDate(week.end_time)}</Text>
                    </div>
                    
                    <div>
                      <Text strong>Duration:</Text>
                      <br />
                      <Tag color="blue">{getWeekDuration(week.start_time, week.end_time)}</Tag>
                    </div>
                    
                    <div>
                      <Text strong>Services:</Text>
                      <br />
                      {getServiceDisplay(week.services)}
                    </div>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    <div>
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Created: {formatDateTime(week.created_at)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px' }}>
            <Text type="secondary">
              Showing {filteredWeeks.length} week{filteredWeeks.length !== 1 ? 's' : ''}
              {selectedMonth && selectedYear ? ` for ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` : selectedYear ? ` for ${selectedYear}` : ''}
            </Text>
          </div>
        </>
      )}
      
      {/* Service Management Modal */}
      <Modal
        title={`Manage Services - ${selectedWeek ? getWeekTitle(selectedWeek) : ''}`}
        open={serviceModalVisible}
        onOk={handleServiceSubmit}
        onCancel={handleServiceCancel}
        confirmLoading={serviceLoading}
        width={600}
        okText="Save Services"
      >
        <Form
          form={serviceForm}
          layout="vertical"
          initialValues={{
            services: [
              { name: 'Voltage', time: '11AM', sic: '' },
              { name: 'Little Eagle, All Star, Super Trooper', time: '11AM', sic: '' },
              { name: 'Little Eagle, All Star, Super Trooper', time: '1PM', sic: '' }
            ]
          }}
        >
          <Form.List name="services">
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="top">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Service Name"
                          rules={[{ required: true, message: 'Service name is required' }]}
                        >
                          <Select disabled>
                            <Select.Option value="Voltage">Voltage</Select.Option>
                            <Select.Option value="Little Eagle, All Star, Super Trooper">
                              Little Eagle, All Star, Super Trooper
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'time']}
                          label="Time"
                          rules={[{ required: true, message: 'Time is required' }]}
                        >
                          <Select disabled>
                            <Select.Option value="11AM">11AM</Select.Option>
                            <Select.Option value="1PM">1PM</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'sic']}
                          label="Service in Charge"
                        >
                          <Select
                             placeholder="Select Minister"
                             allowClear
                             showSearch
                             filterOption={(input, option) => {
                               const label = option?.label || option?.children;
                               return String(label).toLowerCase().includes(input.toLowerCase());
                             }}
                          >
                            {ministers.map(minister => (
                              <Select.Option key={minister.id} value={minister.id}>
                                {minister.first_name} {minister.last_name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default WeeksList;