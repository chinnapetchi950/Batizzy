import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal as RNModal,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {icons, images} from '../../helper/imageConstants';
import {hp, wp} from '../../helper/constants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import CustomSearchBar from '../../common/CustomSearchBar';
import Video from 'react-native-video';
import Carousel from 'react-native-snap-carousel';
import BottomSheetCondition from '../../common/BottomSheetCondition';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import {routes} from '../../navigation/Routes';
import {navigate} from '../../navigation/rootNavigator';
import {showMessage} from 'react-native-flash-message';
import DocumentPicker from 'react-native-document-picker';
import Colors from '../../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import axios from 'axios';
import Icons from '../../common/Icons';
import FontFamily from '../../helper/FontFamily';

const {width: screenWidth} = Dimensions.get('window');

const SocialListScreen = () => {
  const navigation = useNavigation();
  const videoRef = useRef();
  const {t} = useTranslation();

  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isPostIdForComment, setPostIdForComment] = useState('');
  const [isCommentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  const [isIsSocialPostList, setIsSocialPostList] = useState([]);
  const [isCommentList, setIsCommentList] = useState([]);
  const [filteredPostList, setFilteredPostList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState('');
  const [isUserId, setUserId] = useState('');
  const [isPhotos, setIsPhotos] = useState([]);
  const [loginUserID, setLoginUserID] = useState();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShowRemoveButton, showRemoveButton] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  const toggleCommentSheet = ID => {
    GetCommentList(ID);
    setIsCommentSheetOpen(!isCommentSheetOpen);
  };

  useEffect(() => {
    getSocialPostList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  const getUserData = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `profile`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setUserData(response.data.data);
        setLoginUserID(response.data.data?.id);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const getSocialPostList = useCallback(async () => {
    try {
      setIsLoading(true);
      const Token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}posts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
      });
      const res = await response.json();
      if (res.status === true) {
        setIsSocialPostList(res.data);
        setFilteredPostList(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const FullScreenImageViewer = ({
    isVisible,
    images,
    currentIndex,
    onClose,
  }) => {
    const imageItems = Array.isArray(images) ? images : [];
    

    return (
      <RNModal animationType="fade" transparent={false} visible={isVisible}>
        <View style={styles.fullScreenContainer}>
          {imageItems.length > 0 && (
  <Carousel
    data={imageItems}

    // data={imageItems}
    renderItem={({item}) => (
      <Image
        source={{uri: item.uri}}
        style={styles.fullScreenImage}
        resizeMode="contain"
      />
    )}
    sliderWidth={screenWidth}
    itemWidth={screenWidth}
    firstItem={Math.min(currentIndex, imageItems.length - 1)}
  />
)}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image source={icons.CloseIcon} style={styles.closeButtonModal} />
          </TouchableOpacity>
        </View>
      </RNModal>
    );
  };

  const PostCard = ({
    index,
    post = {},
    toggleCommentSheet,
    onPressLikeBtn,
    userID,
    onPressFollowBtn,
    onPresBlockBtn,
    followButtonText,
  }) => {
    const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

    if (followButtonText === 'not_following') {
      followButtonText = 'Follow';
    } else if (followButtonText === 'request_sent') {
      followButtonText = 'Requested';
    } else {
      if (loginUserID != post?.user?.id) {
        followButtonText = 'Following';
      }
      if (loginUserID === post?.user?.id) {
        followButtonText = '';
      }
    }

    const mediaItems =
      post.attachments && post.attachments.length > 0
        ? post.attachments.map((attachment, i) => ({
            type: attachment.file_type.startsWith('image/') ? 'image' : 'video',
            uri: `${IMAGE_URL}${attachment.file_path}`,
          }))
        : post.background_image
        ? [{type: 'image', uri: `${IMAGE_URL}${post.background_image}`}]
        : [];
// console.log("mediaItems",mediaItems);

    const renderMedia = ({item, index}) => {
      // console.log(item,"itemitemitemitemitemitemitemitemitem");
      
      if (item?.type === 'image') {
        return (
          <Pressable style={{marginHorizontal:10}} onPress={() => setIsFullScreenVisible(true)}>
            <Image
              source={{uri: item?.uri}}
              style={{
                height: hp(30),
                width: '96%',
                borderRadius: 15,
                marginLeft: 3,
                marginTop:10
              }}
              key={'media' + index}
            />
          </Pressable>
        );
      } else if (item?.type === 'video') {
        return (
          <View
            style={{
              height: hp(30),
              width: '98%',
              borderRadius: 15,
              marginLeft: 3,
              overflow: 'hidden',
            }}>
            <Video
              source={{uri: item?.uri}}
              style={{
                height: '100%',
                width: '100%',
              }}
              controls={true}
              paused={true}
              key={index}
              resizeMode="cover"
              repeat={false}
            />
          </View>
        );
      }
      return null;
    };

    return (
      <View key={'card' + index} style={styles.card}>
        {post.attachments.length === 0 ? (
          <View style={styles.plainViewContainer}>
            <Text style={styles.plainViewText}>{post.content}</Text>
          </View>
        ) : (
          <>
           <View style={styles.dotContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Pressable>
  <Image
    source={
      post?.user?.profile_image
        ? { uri: IMAGE_URL + post.user.profile_image }
        : icons.dummyUser
    }
    style={styles.profileImage}
  />
</Pressable>
              <Pressable
                onPress={() => {
                  if (loginUserID === post?.user?.id) {
                    navigate(routes.UserProfile);
                  } else {
                    navigate(routes.OtherUserProfile, {
                      UserID: post?.user?.id,
                      type: post?.user_type,
                    });
                  }
                }}>
                <Text style={styles.username}>{post?.user?.name}</Text>
              </Pressable>
              {post?.user?.id != userID && (
                <Pressable
                  onPress={() => {
                    onPressFollowBtn();
                  }}>
                  <Text style={styles.follow}> · {followButtonText}</Text>
                </Pressable>
              )}
            </View>
            {post?.user?.id != userID && (
              <Pressable
                onPress={() => {
                  showRemoveButton(!isShowRemoveButton);
                  setActivePostId(post?.id);
                }}>
                <Image
                  source={icons.horizontalThreeDot}
                  style={styles.horizontalThreeDotIcon}
                />
              </Pressable>
            )}
            {activePostId === post.id && (
              <View style={styles.removePostBtnContainer}>
                <Pressable
                  style={styles.blockContainer}
                  onPress={() => {
                    onPresBlockBtn();
                    setActivePostId(null);
                  }}>
                  <Image source={icons.blockIcon} style={styles.blockIcon} />
                  <Text style={styles.blockText}>
                    {t('otheruserprofile.block')}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.repotContainer}
                  onPress={() =>
                    gotoReportUser(post?.user?.id, post?.user_type, post?.id)
                  }>
                  <Image source={icons.reportIcon} style={styles.reportIcon} />
                  <Text style={styles.reportText}>
                    {t('otheruserprofile.report')}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
          {mediaItems.length > 0 && (
            <Carousel
               data={mediaItems}  

              renderItem={renderMedia}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              onSnapToItem={index => setActiveIndex(index)} // Update active index on snap
            />
          )}
            {mediaItems?.length > 1 && (
              <View style={styles.pagination}>
                {mediaItems.map((_, index) => (
                  <View
                    key={'slider' + index}
                    style={[
                      styles.dot,
                      index === activeIndex ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}
        <FullScreenImageViewer
          isVisible={isFullScreenVisible}
          images={mediaItems.filter((item, i) => item.type === 'image')}
          currentIndex={activeIndex}
          onClose={() => setIsFullScreenVisible(false)}
        />

        <View style={styles.detailsContainer}>
         
          <Text style={styles.time}>
            {post?.created_at_hrf} {post?.suggestedText}
          </Text>
          <Text style={styles.tag}>{post?.content}</Text>

          <View style={styles.interactionRow}>
            <TouchableOpacity style={styles.iconRow} onPress={onPressLikeBtn}>
              <Image
                source={post?.is_liked ? icons.LikeFillIcon : icons.likeIcon}
                style={styles.likeicon}
              />
              <Text style={styles.countsText}>{post?.total_likes}</Text>
            </TouchableOpacity>
            <View style={styles.commentRow}>
              <Pressable onPress={toggleCommentSheet}>
                <Image source={icons.commentIcon} style={styles.commentIcon} />
              </Pressable>
              <Text style={styles.countsText}>{post?.total_comments}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const likePost = async ID => {
    var Token = await AsyncStorage.getItem('accessToken');

    await fetch(BASE_URL + 'posts/' + ID + '/like', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          getSocialPostList();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const GetCommentList = useCallback(async ID => {
    try {
      const Token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}posts/${ID}/comments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
      });
      const res = await response.json();

      if (res.status === true) {
        setIsCommentList(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const PostComment = async (ID, parentId = null) => {
    try {
      const Token = await AsyncStorage.getItem('accessToken');
      const formData = new FormData();

      if (isCommentText) {
        formData.append('content', isCommentText);
      }

      if (parentId) {
        formData.append('parent_id', parentId);
      }

      if (isPhotos && isPhotos.length > 0) {
        isPhotos?.forEach((image, index) => {
          formData.append('attachments[]', {
            uri: image.uri,
            type: image.type,
            name: image.name,
          });
        });
      }
      const response = await fetch(BASE_URL + 'posts/' + ID + '/comment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const res = await response.json();

      if (res.status === true) {
        setCommentText('');
        setIsPhotos('');
        GetCommentList(ID);
        getSocialPostList();
      } else {
        handleApiError(res);
      }
    } catch (error) {
      console.error('Errorsxx:', error);
    }
  };

  const LikeComment = async ID => {
    var Token = await AsyncStorage.getItem('accessToken');

    await fetch(BASE_URL + 'comments/' + ID + '/like', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          getSocialPostList();
          GetCommentList(isPostIdForComment);
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const SendFollowRequest = async (otherUserId, userType) => {
    var Token = await AsyncStorage.getItem('accessToken');

    var formData = new FormData();
    formData.append('following_type', userType);

    await fetch(BASE_URL + 'social_follow-request/' + otherUserId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          AsyncStorage.setItem('accessToken', res.token);
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getSocialPostList();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const UnfollowUser = async (otherUserId, userType) => {
    var Token = await AsyncStorage.getItem('accessToken');

    var formData = new FormData();
    formData.append('following_type', userType);

    await fetch(BASE_URL + 'social_unfollow/' + otherUserId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getSocialPostList();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const Blockuser = async (ID, userType) => {
    var Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();

    formData.append('blocked_user_id', ID);
    formData.append('blocked_user_type', userType);

    await fetch(BASE_URL + 'block', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getSocialPostList();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const gotoReportUser = async (ID, userType, postID) => {
    var Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();

    formData.append('reported_id', ID);
    formData.append('reported_type', userType);
    formData.append('reason', 'false_information');
    formData.append('post_id', postID);
    await fetch(BASE_URL + 'report-user', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getSocialPostList();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleApiError = response => {
    const {message, error_details} = response;
    showMessage({
      message: message || 'An error occurred',
      type: 'warning',
    });

    if (error_details) {
      Object.keys(error_details).forEach(field => {
        // Capitalize the first letter of the field for better readability
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
        showMessage({
          message: `${formattedField}: ${error_details[field][0]}`,
          type: 'warning',
        });
      });
    }
  };

  const PickPhotos = async () => {
    if (isPhotos.length >= 10) {
      showMessage({
        message: t('socialPostScreen.imageLimitExceeded'),
        type: 'warning',
      });
      return;
    }
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
        allowMultiSelection: false,
      });

      // If within the limit, add the selected images
      const newDocument = {
        uri: results[0].uri,
        type: results[0].type,
        name: results[0].name,
      };

      setIsPhotos([newDocument]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredPostList(isIsSocialPostList);
    } else {
      const filtered = isIsSocialPostList.filter(post => {
        const contentMatch = post.content
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase());
        const userNameMatch = post.user?.name
          ? post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
          : false;
        return contentMatch || userNameMatch;
      });
      setFilteredPostList(filtered);
    }
  };

  const renderReply = (reply, depth = 1) => {
    return (
      <View
        key={reply.id}
        style={[styles.commentContainer, {marginLeft: depth * 40}]}>
        {reply?.user?.profile_image ? (
          <Image
            source={{uri: IMAGE_URL + reply.user.profile_image}}
            style={styles.avatar}
          />
        ) : (
          <Image source={icons.dummyUser} style={styles.avatar} />
        )}
        <View style={styles.commentContent}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.commentUsername}>{reply.user.name}</Text>
            <Text style={styles.commentTime}>{reply.created_at_hrf}</Text>
          </View>
          {reply.attachments && reply.attachments.length > 0 ? (
            <Image
              source={{
                uri: IMAGE_URL + reply.attachments[0].file_path,
              }}
              style={styles.commentAttchImage}
            />
          ) : (
            <Text style={styles.commentText}>{reply.content}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderComment = ({item}) => {
    const repliesCount = item.replies ? item.replies.length : 0;
    const isExpanded = expandedComments[item.id];

    const handleReplyToggle = commentId => {
      setReplyingTo(prevState => (prevState === commentId ? null : commentId));
    };

    const toggleReplies = commentId => {
      setExpandedComments(prev => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    };

    return (
      <View>
        <View style={styles.commentContainer}>
          {item?.user?.profile_image ? (
            <Image
              source={{uri: IMAGE_URL + item.user.profile_image}}
              style={styles.avatar}
            />
          ) : (
            <Image source={icons.dummyUser} style={styles.avatar} />
          )}
          <View style={styles.commentContent}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.commentUsername}>{item.user.name}</Text>
              <Text style={styles.commentTime}>{item.created_at_hrf}</Text>
            </View>
            {item.attachments && item.attachments.length > 0 ? (
              <Image
                source={{
                  uri: IMAGE_URL + item.attachments[0].file_path,
                }}
                style={styles.commentAttchImage}
              />
            ) : (
              <Text style={styles.commentText}>{item.content}</Text>
            )}
            <View style={styles.commentActions}>
              <TouchableOpacity onPress={() => handleReplyToggle(item.id)}>
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
              {repliesCount > 0 && (
                <TouchableOpacity onPress={() => toggleReplies(item.id)}>
                  <Text style={{marginLeft: 10}}>
                    {isExpanded
                      ? 'Hide Replies'
                      : `View ${repliesCount} ${
                          repliesCount === 1 ? 'Reply' : 'Replies'
                        }`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.likeContainer}>
            <Pressable
              onPress={() => {
                LikeComment(item.id);
              }}>
              <Image
                source={
                  item.is_liked === true ? icons.LikeFillIcon : icons.likeIcon
                }
                style={styles.commentLikeicon}
              />
            </Pressable>
            <Text style={styles.likeCount}>{item.likes_count}</Text>
          </View>
        </View>
        {isExpanded &&
          item.replies &&
          item.replies.map(reply => renderReply(reply, 1))}
      </View>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('error.recordNotFound')}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getSocialPostList();
    setRefreshing(false);
  };

  const createSocialPost = () => {
    navigation.navigate(routes.CreateSocialPost);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {t('socialPostScreen.greeting') + ' ' + userData?.name}
          </Text>
        </View>
        <View style={styles.IconsContainer}>
          <Pressable
            onPress={() => navigation.navigate(routes.NotificationListScreen)}>
            <Image
              source={icons.notificationIcon}
              style={styles.notificationIcon}
            />
          </Pressable>
          {userData?.unread_notifications_count != 0 && (
            <Text style={styles.notificationCount}>
              {userData?.unread_notifications_count}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.searchBarContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            //marginRight: 10,
          }}>
          <CustomSearchBar
            containerStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPressProfile={() => {
              navigation.navigate(routes.UserProfile);
            }}
            isProfileImage
            profileImageSource={{
              uri: userData.profile_image
                ? IMAGE_URL + userData.profile_image
                : images.profileDummy,
            }}
            onBackPress={{}}
            onPressSearch={handleSearch}
            placeholder={t('socialPostScreen.placeholder')}
            width={'75%'}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              handleSearch();
            }}
          />
          <TouchableOpacity onPress={() => createSocialPost()}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10,
              }}>
              <Icons
                iconSetName={'FontAwesome6'}
                iconName={'circle-plus'}
                iconColor={Colors.primary}
                iconSize={20}
              />
              <Text style={[styles.AddPostContainer]}>
                {t('socialPostScreen.addPost')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        data={filteredPostList}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => emptyMesRender()}
        renderItem={({item, index}) => {
          return (
            <PostCard
              index={index}
              post={item}
              userID={isUserId}
              toggleCommentSheet={() => {
                setPostIdForComment(item.id);
                setIsPhotos('');
                toggleCommentSheet(item.id);
              }}
              onPressLikeBtn={() => {
                likePost(item.id);
              }}
              onPressFollowBtn={() => {
                if (item?.follow_status === 'following') {
                  UnfollowUser(item.user.id, item.user_type);
                } else {
                  SendFollowRequest(item.user.id, item.user_type);
                }
              }}
              followButtonText={item?.follow_status}
              onPresBlockBtn={() => {
                Blockuser(item.user.id, item.user_type);
              }}
            />
          );
        }} // Pass toggleCommentSheet as a prop
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {isCommentSheetOpen && (
        <BottomSheetCondition
          maxHeight={hp(65)}
          isOpen={isCommentSheetOpen}
          onClose={toggleCommentSheet}
          renderContent={() => {
            return (
              <>
                <Text style={styles.commentMainTitleText}>
                  {t('socialPostScreen.comments')}
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{}}>
                    <View style={{}}>
                      <FlatList
                        inverted
                        data={isCommentList}
                        renderItem={renderComment}
                        keyExtractor={item => item.id}
                      />
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.selectedCommentImageContainer} />
                {isPhotos.length > 0 && (
                  <Image
                    source={{uri: isPhotos[0]?.uri}}
                    style={styles.selectedCommentImage}
                  />
                )}
                <View style={styles.commentInputContainer}>
                  {userData.profile_image ? (
                    <Image
                      source={{uri: IMAGE_URL + userData.profile_image}}
                      style={styles.commentInputAvatar}
                    />
                  ) : (
                    <Image
                      source={icons.dummyUser}
                      style={styles.commentInputAvatar}
                    />
                  )}
                  <TextInput
                    value={isCommentText}
                    style={styles.commentInput}
                    placeholder={
                      replyingTo
                        ? t('socialPostScreen.writeReply')
                        : t('socialPostScreen.addComment')
                    }
                    placeholderTextColor={Colors.lightPlaceholder}
                    onChangeText={setCommentText}
                  />
                  <Pressable
                    onPress={() => {
                      PickPhotos();
                    }}>
                    <Image
                      source={icons.attachment}
                      style={styles.AttchmentIcon}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      PostComment(isPostIdForComment, replyingTo);
                    }}>
                    <Image
                      source={icons.sendMessageIcon}
                      style={styles.sendMessageIcon}
                    />
                  </Pressable>
                </View>
              </>
            );
          }}
        />
      )}

      {isLoading && (
        <Modal isVisible={isLoading} style={styles.modalContainer}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={'small'} color={Colors.primary} />
          </View>
        </Modal>
      )}
    </View>
  );
};

export default SocialListScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
   profileImage: {
  height: hp(3.3),
  width: hp(3.3),
  borderRadius: hp(3.3) / 2, // perfectly circular
  resizeMode: 'cover',       // ensures image fills the circle
  overflow: 'hidden',        // clips any extra parts
},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    color: 'black',
    fontSize: responsiveFontSize(2.4),
    fontFamily: 'Inter-SemiBold',
  },
  viewAccountText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    color: '#754595',
    marginLeft: wp(2),
  },
  IconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    height: hp(2.2),
    width: hp(2.2),
  },
  notificationIcon: {
    height: hp(3),
    width: hp(3),
    marginHorizontal: 7,
  },
  likeicon: {
    height: hp(2.8),
    width: hp(2.8),
    resizeMode: 'contain',
    // marginHorizontal: 7,
  },
  commentLikeicon: {
    height: hp(2.3),
    width: hp(2.3),
    resizeMode: 'contain',
  },
  horizontalThreeDotIcon: {
    height: 4,
    width: 18,
    resizeMode: 'contain',
  },
  commentIcon: {
    height: hp(2.8),
    width: hp(2.8),
    resizeMode: 'contain',
    // marginHorizontal: 7,
  },
  notificationCount: {
    backgroundColor: 'red',
    height: hp(2.2),
    width: hp(2.2),
    borderRadius: 50,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    position: 'absolute',
    top: -7,
    left: 20,
  },
  chatIcon: {
    height: hp(3),
    width: hp(3),
    marginLeft: 5,
  },
  searchBarContainer: {
    margin: 5,
  },

  card: {
    marginBottom: 20,
    marginTop:10,
    backgroundColor: 'white',
    //marginHorizontal:15,
    // alignItems:'center',
    // alignContent:'center'
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7d4ed4',
    marginHorizontal: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  detailsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  username: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Nunito-Medium',
    color: '#1D1D1D',
    marginLeft: 8,
  },
  follow: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
  },
  time: {
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Nunito-SemiBold',
    marginTop: 3,
  },
  plainViewText: {
    color: '#000000',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Nunito-SemiBold',
    padding: 15,
  },
  plainViewContainer: {
    height: hp(15),
    width: screenWidth,
    backgroundColor: '#FAF9F6',
    marginBottom: 4,
  },
  tag: {
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Nunito-Medium',
    marginTop: 3,
  },
  interactionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  countsText: {
    color: '#000000',
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 3,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal:15,
    marginBottom:10
  },
  //////
  commentMainContainer: {
    flex: 1,
    padding: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentInputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5,
  },
  AttchmentIcon: {
    width: hp(2.5),
    height: hp(2.5),
    marginRight: 5,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  sendMessageIcon: {
    width: 40,
    height: 40,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
  },
  commentText: {
    // marginVertical: 5,
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
  },
  commentAttchImage: {
    height: 60,
    width: 60,
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 3,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-Regular',
    marginLeft: 10,
  },
  replyText: {
    color: '#6B6B6B',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
  },
  likeCount: {
    color: '#000000',
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-SemiBold',
  },
  likeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    fontSize: 18,
  },
  replyContainer: {
    marginTop: 10,
    paddingLeft: 50,
  },
  replyComment: {
    paddingVertical: 5,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginTop: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  selectedCommentImageContainer: {
    height: 1,
    backgroundColor: 'lightgray',
    width: '100%',
    marginTop: 5,
  },
  selectedCommentImage: {
    height: 80,
    width: 80,
    marginHorizontal: 10,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    color: Colors.fontDarkGray,
  },
  commentMainTitleText: {
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    height: hp(8),
    width: hp(8),
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: responsiveFontSize(2.35),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: hp(5),
    color: '#000000',
  },
  //////
  fullScreenContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  closeButtonModal: {
    height: hp(3.2),
    width: hp(3.2),
  },
  removePostBtnContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 15,
    alignItems: 'flex-start',
    position: 'absolute',
    justifyContent: 'center',
    right: -20,
    top: 5,
  },
  blockIcon: {
    height: 20,
    width: 20,
  },
  reportIcon: {
    height: 20,
    width: 20,
  },
  blockText: {
    fontSize: responsiveFontSize(1.41),
    color: '#1D1D1D',
    fontFamily: 'Nunito-Medium',
    marginLeft: 10,
  },
  reportText: {
    fontSize: responsiveFontSize(1.41),
    color: '#1D1D1D',
    fontFamily: 'Nunito-Medium',
    marginLeft: 10,
  },
  blockContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  repotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: '10%',
  },
  AddPostContainer: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.4),
    fontFamily: FontFamily.InterMedium,
    marginTop: 3,
    width: 50,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
