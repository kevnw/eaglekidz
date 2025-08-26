import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Spin, Empty, Space, Row, Col, Divider, Tag } from 'antd';
import { EyeOutlined, CloseOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiService, Review } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

interface ViewReviewsProps {
  weekId: string;
  weekTitle: string;
  onClose?: () => void;
}

const ViewReviews: React.FC<ViewReviewsProps> = ({ weekId, weekTitle, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [weekId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getReviewsByWeekId(weekId);
      
      if (response.data) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load reviews. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <EyeOutlined />
            <span>Reviews</span>
          </Space>
        }
        extra={
          onClose && (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
            />
          )
        }
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Alert
            message={`Loading reviews for: ${weekTitle}`}
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
          />
          <Spin size="large" />
          <Text type="secondary">Loading reviews...</Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <EyeOutlined />
          <span>Reviews</span>
        </Space>
      }
      extra={
        onClose && (
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onClose}
          />
        )
      }
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message={`Reviews for: ${weekTitle}`}
          type="info"
          showIcon
          icon={<CalendarOutlined />}
          style={{ borderRadius: 8 }}
        />
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ borderRadius: 8 }}
          />
        )}

        {reviews.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text>No reviews found for this week.</Text>
                <Text type="secondary">Click "Add Review" to create the first review.</Text>
              </Space>
            }
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {reviews.map((review) => (
              <Col xs={24} key={review.id}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                  }}
                  title={
                    <Space>
                      <EyeOutlined style={{ color: '#1890ff' }} />
                      <span>Review</span>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        {formatDate(review.created_at)}
                      </Tag>
                    </Space>
                  }
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Title level={5} style={{ marginBottom: 8, color: '#52c41a' }}>
                        What Went Well:
                      </Title>
                      <Paragraph style={{ marginBottom: 0, paddingLeft: 16 }}>
                        {review.what_went_well}
                      </Paragraph>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div>
                      <Title level={5} style={{ marginBottom: 8, color: '#faad14' }}>
                        What Can Be Improved:
                      </Title>
                      <Paragraph style={{ marginBottom: 0, paddingLeft: 16 }}>
                        {review.can_improve}
                      </Paragraph>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div>
                      <Title level={5} style={{ marginBottom: 8, color: '#1890ff' }}>
                        Action Plans:
                      </Title>
                      <Paragraph style={{ marginBottom: 0, paddingLeft: 16 }}>
                        {review.action_plans}
                      </Paragraph>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div>
                      <Title level={5} style={{ marginBottom: 8, color: '#722ed1' }}>
                        Summary:
                      </Title>
                      <div 
                        style={{ 
                          marginBottom: 0, 
                          paddingLeft: 16,
                          padding: '8px 12px', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '6px', 
                          backgroundColor: '#fafafa',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                        dangerouslySetInnerHTML={{ __html: review.summary }}
                      />
                    </div>
                    
                    {review.updated_at !== review.created_at && (
                      <>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ textAlign: 'right' }}>
                          <Tag icon={<ClockCircleOutlined />} color="orange">
                            Last updated: {formatDate(review.updated_at)}
                          </Tag>
                        </div>
                      </>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        {onClose && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <Button
              size="large"
              onClick={onClose}
              style={{ borderRadius: 8 }}
            >
              Close
            </Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ViewReviews;