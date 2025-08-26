import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Alert,
  Spin,
  Empty,
  Space,
  Row,
  Col,
  Select,
  Button,
  Tag,
  Divider,
  Input,
  DatePicker,
  Statistic,
  Tooltip
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { apiService, Review, Week } from '../../services/api';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ReviewWithWeek extends Review {
  week?: Week;
}

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewWithWeek[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithWeek[]>([]);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, selectedYear, selectedMonth, selectedWeek, searchText, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all reviews and weeks
      const [reviewsResponse, weeksResponse] = await Promise.all([
        apiService.getAllReviews(),
        apiService.getAllWeeks()
      ]);
      
      if (reviewsResponse.data && weeksResponse.data) {
        const reviewsData = reviewsResponse.data.filter(review => !review.deleted);
        const weeksData = weeksResponse.data;
        
        // Combine reviews with week information
        const reviewsWithWeeks = reviewsData.map(review => {
          const week = weeksData.find(w => w.id === review.week_id);
          return { ...review, week };
        });
        
        setReviews(reviewsWithWeeks);
        setWeeks(weeksData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(review => {
        if (!review.week) return false;
        return dayjs(review.week.start_time).year() === selectedYear;
      });
    }

    // Filter by month
    if (selectedMonth !== null) {
      filtered = filtered.filter(review => {
        if (!review.week) return false;
        return dayjs(review.week.start_time).month() === selectedMonth;
      });
    }

    // Filter by specific week
    if (selectedWeek) {
      filtered = filtered.filter(review => review.week_id === selectedWeek);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(review => {
        if (!review.week) return false;
        const weekStart = dayjs(review.week.start_time);
        return weekStart.isAfter(dateRange[0]) && weekStart.isBefore(dateRange[1]);
      });
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(review => 
        review.what_went_well.toLowerCase().includes(searchLower) ||
        review.can_improve.toLowerCase().includes(searchLower) ||
        review.action_plans.toLowerCase().includes(searchLower) ||
        review.summary.toLowerCase().includes(searchLower) ||
        (review.week && getWeekTitle(review.week).toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf());

    setFilteredReviews(filtered);
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedWeek(null);
    setSearchText('');
    setDateRange(null);
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    weeks.forEach(week => {
      years.add(dayjs(week.start_time).year());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getAvailableMonths = () => {
    if (!selectedYear) return [];
    const months = new Set<number>();
    weeks.forEach(week => {
      const weekDate = dayjs(week.start_time);
      if (weekDate.year() === selectedYear) {
        months.add(weekDate.month());
      }
    });
    return Array.from(months).sort();
  };

  const getAvailableWeeks = () => {
    let availableWeeks = weeks;
    
    if (selectedYear) {
      availableWeeks = availableWeeks.filter(week => 
        dayjs(week.start_time).year() === selectedYear
      );
    }
    
    if (selectedMonth !== null) {
      availableWeeks = availableWeeks.filter(week => 
        dayjs(week.start_time).month() === selectedMonth
      );
    }
    
    return availableWeeks.sort((a, b) => 
      dayjs(b.start_time).valueOf() - dayjs(a.start_time).valueOf()
    );
  };

  const handleViewReview = (review: ReviewWithWeek) => {
    navigate(`/reviews/${review.id}`, {
      state: { weekTitle: review.week ? getWeekTitle(review.week) : `Week ${review.week_id}`, previousPath: '/reviews' }
    });
  };

  const handleEditReview = (review: ReviewWithWeek) => {
    navigate(`/reviews/${review.id}/edit`, {
      state: { weekTitle: review.week ? getWeekTitle(review.week) : `Week ${review.week_id}`, review, previousPath: '/reviews' }
    });
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  const getWeekTitle = (week: Week) => {
    return `Week of ${formatDate(week.start_time)}`;
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Reviews Overview
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          View and manage all church reviews with advanced filtering options
        </Paragraph>
        
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Total Reviews"
                value={reviews.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="This Month"
                value={reviews.filter(r => r.week && dayjs(r.week.start_time).month() === dayjs().month()).length}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Filtered Results"
                value={filteredReviews.length}
                prefix={<FilterOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              style={{ height: '100%', width: '100%' }}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <FilterOutlined style={{ marginRight: '8px' }} />
          Filters
        </Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search reviews..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Year"
              value={selectedYear}
              onChange={setSelectedYear}
              allowClear
              style={{ width: '100%' }}
            >
              {getAvailableYears().map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              allowClear
              disabled={!selectedYear}
              style={{ width: '100%' }}
            >
              {getAvailableMonths().map(month => (
                <Option key={month} value={month}>
                  {dayjs().month(month).format('MMMM')}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Select Week"
              value={selectedWeek}
              onChange={setSelectedWeek}
              allowClear
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {getAvailableWeeks().map(week => (
                <Option key={week.id} value={week.id}>
                  {getWeekTitle(week)} ({formatDate(week.start_time)})
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Button 
              onClick={clearFilters}
              style={{ width: '100%' }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {reviews.length === 0 ? 'No reviews found' : 'No reviews match your filters'}
              </span>
            }
          >
            {reviews.length === 0 && (
              <Button type="primary" onClick={() => navigate('/weeks')}>
                Go to Weeks to Add Reviews
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredReviews.map((review) => (
            <Col xs={24} lg={12} xl={8} key={review.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Tooltip title="View Details">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => handleViewReview(review)}
                    />
                  </Tooltip>,
                  <Tooltip title="Edit Review">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={() => handleEditReview(review)}
                    />
                  </Tooltip>
                ]}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Title level={5} style={{ margin: 0, flex: 1 }}>
                      {review.week ? getWeekTitle(review.week) : 'Unknown Week'}
                    </Title>
                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                      {review.week ? formatDate(review.week.start_time) : 'N/A'}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Created: {formatDateTime(review.created_at)}
                  </Text>
                </div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '4px' }}>
                    What Went Well:
                  </Text>
                  <Paragraph style={{ margin: 0, fontSize: '13px' }}>
                    {truncateText(review.what_went_well)}
                  </Paragraph>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ color: '#faad14', display: 'block', marginBottom: '4px' }}>
                    Can Improve:
                  </Text>
                  <Paragraph style={{ margin: 0, fontSize: '13px' }}>
                    {truncateText(review.can_improve)}
                  </Paragraph>
                </div>
                
                {review.summary && review.summary.trim() && review.summary !== '<p></p>' && (
                  <div>
                    <Text strong style={{ color: '#1890ff', display: 'block', marginBottom: '4px' }}>
                      Summary:
                    </Text>
                    <div 
                      style={{ 
                        margin: 0, 
                        fontSize: '13px',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        position: 'relative',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }}
                      dangerouslySetInnerHTML={{ __html: review.summary }}
                    />
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ReviewsPage;