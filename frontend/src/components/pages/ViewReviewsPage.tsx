import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Typography, Alert, Spin, Empty, Space, Row, Col, Tag, Popconfirm, Divider, Collapse } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, ClockCircleOutlined, RestOutlined } from '@ant-design/icons';
import { apiService, Review } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface LocationState {
  weekTitle?: string;
}

const ViewReviewsPage: React.FC = () => {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deletedReviews, setDeletedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  const weekTitle = state?.weekTitle || `Week ${weekId}`;

  useEffect(() => {
    fetchReviews();
    fetchDeletedReviews();
  }, [weekId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!weekId) {
        throw new Error('Week ID is missing');
      }
      
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

  const fetchDeletedReviews = async () => {
    try {
      setDeletedLoading(true);
      
      if (!weekId) {
        return;
      }
      
      const response = await apiService.getDeletedReviewsByWeekId(weekId);
      
      if (response.data) {
        setDeletedReviews(response.data);
      } else {
        setDeletedReviews([]);
      }
    } catch (err) {
      // Silently handle errors for deleted reviews as it's not critical
      setDeletedReviews([]);
    } finally {
      setDeletedLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  const handleBackToWeeks = () => {
    navigate('/weeks');
  };

  const handleAddReview = () => {
    navigate(`/weeks/${weekId}/add-review`, {
      state: { weekTitle }
    });
  };

  const handleEditReview = (review: Review) => {
    // Navigate to edit review page
    navigate(`/weeks/${weekId}/reviews/${review.id}/edit`, {
      state: { weekTitle, review }
    });
  };

  const handleDeleteClick = async (review: Review) => {
    try {
      setDeleting(true);
      await apiService.deleteReview(review.id);
      
      // Remove the deleted review from the active list and add to deleted list
      setReviews(reviews.filter(r => r.id !== review.id));
      setDeletedReviews([...deletedReviews, { ...review, deleted: true }]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete review. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleHardDeleteClick = async (review: Review) => {
    try {
      setHardDeleting(true);
      await apiService.hardDeleteReview(review.id);
      
      // Remove the review from deleted list permanently
      setDeletedReviews(deletedReviews.filter(r => r.id !== review.id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to permanently delete review. Please try again.');
      }
    } finally {
      setHardDeleting(false);
    }
  };

  const handleRestoreClick = async (review: Review) => {
    try {
      setHardDeleting(true);
      await apiService.restoreReview(review.id);
      
      // Remove the review from deleted list and add back to active list
      setDeletedReviews(deletedReviews.filter(r => r.id !== review.id));
      setReviews([...reviews, { ...review, deleted: false }]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to restore review. Please try again.');
      }
    } finally {
      setHardDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Title level={3}>Loading Reviews</Title>
              <Text type="secondary">Loading reviews for: <strong>{weekTitle}</strong></Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: '#fadb14' }} />
              Reviews
            </Title>
            <Text type="secondary">Reviews for: <strong>{weekTitle}</strong></Text>
          </div>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToWeeks}
            >
              Back to Weeks
            </Button>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddReview}
            >
              Add New Review
            </Button>
          </Space>
        </div>
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

      {/* Reviews Content */}
      {reviews.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4}>No Reviews Found</Title>
                <Paragraph type="secondary">
                  No reviews have been created for this week yet.
                </Paragraph>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddReview}
              size="large"
            >
              Create First Review
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          {/* Reviews Header */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              All Reviews ({reviews.length})
            </Title>
          </div>
          
          {/* Reviews List */}
          <Row gutter={[16, 16]}>
            {reviews.map((review, index) => (
              <Col key={review.id} xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>Review #{index + 1}</Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditReview(review)}
                        disabled={deleting}
                      />
                      <Popconfirm
                        title="Delete Review"
                        description="Are you sure you want to delete this review? This action cannot be undone."
                        onConfirm={() => handleDeleteClick(review)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={deleting}
                        />
                      </Popconfirm>
                    </Space>
                  }
                  actions={[
                    <Button 
                      key="edit"
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEditReview(review)}
                      disabled={deleting}
                    >
                      Edit Review
                    </Button>
                  ]}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Date Information */}
                    <div>
                      <Space direction="vertical" size="small">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockCircleOutlined style={{ color: '#52c41a' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created: {formatDate(review.created_at)}
                          </Text>
                        </div>
                        {review.updated_at !== review.created_at && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Updated: {formatDate(review.updated_at)}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />
                    
                    {/* What Went Well */}
                    <div>
                      <Title level={5} style={{ marginBottom: '8px', color: '#52c41a' }}>
                        What Went Well:
                      </Title>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {review.what_went_well}
                      </Paragraph>
                    </div>
                    
                    {/* What Can Be Improved */}
                    <div>
                      <Title level={5} style={{ marginBottom: '8px', color: '#faad14' }}>
                        What Can Be Improved:
                      </Title>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {review.can_improve}
                      </Paragraph>
                    </div>
                    
                    {/* Action Plans */}
                    <div>
                      <Title level={5} style={{ marginBottom: '8px', color: '#1890ff' }}>
                        Action Plans:
                      </Title>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {review.action_plans}
                      </Paragraph>
                    </div>
                    
                    {/* Summary */}
                    <div>
                      <Title level={5} style={{ marginBottom: '8px', color: '#722ed1' }}>
                        Summary:
                      </Title>
                      <div 
                        style={{ 
                          marginBottom: 0, 
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
                    
                    {/* Updated Badge */}
                    {review.updated_at !== review.created_at && (
                      <div style={{ textAlign: 'right' }}>
                        <Tag color="blue">Updated</Tag>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Deleted Reviews Section */}
      {deletedReviews.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <Collapse
            items={[
              {
                key: '1',
                label: (
                  <Space>
                    <RestOutlined style={{ color: '#ff4d4f' }} />
                    <Text strong>Deleted Reviews ({deletedReviews.length})</Text>
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {deletedReviews.map((review, index) => (
                      <Col key={review.id} xs={24} lg={12}>
                        <Card
                          title={
                            <Space>
                              <FileTextOutlined style={{ color: '#ff4d4f' }} />
                              <Text strong style={{ color: '#ff4d4f' }}>Deleted Review #{index + 1}</Text>
                            </Space>
                          }
                          extra={
                            <Space>
                              <Button
                                type="text"
                                icon={<RestOutlined />}
                                onClick={() => handleRestoreClick(review)}
                                disabled={hardDeleting}
                                size="small"
                                style={{ color: '#52c41a' }}
                              >
                                Restore
                              </Button>
                              <Popconfirm
                                title="Permanently Delete Review"
                                description="Are you sure you want to permanently delete this review? This action cannot be undone."
                                onConfirm={() => handleHardDeleteClick(review)}
                                okText="Yes, Delete Forever"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  disabled={hardDeleting}
                                  size="small"
                                >
                                  Delete Forever
                                </Button>
                              </Popconfirm>
                            </Space>
                          }
                          style={{ opacity: 0.7 }}
                        >
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Date Information */}
                            <div>
                              <Space direction="vertical" size="small">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Created: {formatDate(review.created_at)}
                                  </Text>
                                </div>
                                {review.updated_at !== review.created_at && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      Updated: {formatDate(review.updated_at)}
                                    </Text>
                                  </div>
                                )}
                              </Space>
                            </div>

                            <Divider style={{ margin: '8px 0' }} />
                            
                            {/* What Went Well */}
                            <div>
                              <Title level={5} style={{ marginBottom: '8px', color: '#52c41a' }}>
                                What Went Well:
                              </Title>
                              <Paragraph style={{ marginBottom: 0 }}>
                                {review.what_went_well}
                              </Paragraph>
                            </div>
                            
                            {/* What Can Be Improved */}
                            <div>
                              <Title level={5} style={{ marginBottom: '8px', color: '#faad14' }}>
                                What Can Be Improved:
                              </Title>
                              <Paragraph style={{ marginBottom: 0 }}>
                                {review.can_improve}
                              </Paragraph>
                            </div>
                            
                            {/* Action Plans */}
                            <div>
                              <Title level={5} style={{ marginBottom: '8px', color: '#1890ff' }}>
                                Action Plans:
                              </Title>
                              <Paragraph style={{ marginBottom: 0 }}>
                                {review.action_plans}
                              </Paragraph>
                            </div>
                            
                            {/* Summary */}
                            <div>
                              <Title level={5} style={{ marginBottom: '8px', color: '#722ed1' }}>
                                Summary:
                              </Title>
                              <div 
                                style={{ 
                                  marginBottom: 0, 
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
                            
                            {/* Deleted Badge */}
                            <div style={{ textAlign: 'right' }}>
                              <Tag color="red">Deleted</Tag>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToWeeks}
        >
          Back to Weeks
        </Button>
      </div>
    </div>
  );
};

export default ViewReviewsPage;