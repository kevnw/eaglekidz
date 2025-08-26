import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Alert, Spin, Empty, Row, Col, Space, Tag, Popconfirm, Divider, Cascader } from 'antd';
import { CalendarOutlined, EyeOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiService, Week } from '../../services/api';
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



  const handleDeleteWeek = async (weekId: string) => {
    try {
      await apiService.deleteWeek(weekId);
      
      // Remove the deleted week from current state immediately
      const updatedWeeks = weeks.filter(week => week.id !== weekId);
      setWeeks(updatedWeeks);
      
      // If no weeks left, reset filters
      if (updatedWeeks.length === 0) {
        setSelectedYear('');
        setSelectedMonth('');
        setCascaderOptions([]);
        setFilteredWeeks([]);
      } else {
        // Refresh from server to ensure consistency
        await fetchWeeks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete week');
    }
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
  }, [refreshTrigger]);

  useEffect(() => {
    filterWeeks();
  }, [weeks, selectedYear, selectedMonth]);

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
                  extra={
                    <Popconfirm
                      title="Delete Week"
                      description="Are you sure you want to delete this week?"
                      onConfirm={() => handleDeleteWeek(week.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  }
                  actions={[
                    <Button 
                      key="view"
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewReviews(week)}
                    >
                      View Reviews
                    </Button>,
                    <Button 
                      key="add"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddReview(week)}
                    >
                      Add Review
                    </Button>
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
    </div>
  );
};

export default WeeksList;