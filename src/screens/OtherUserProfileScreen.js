import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal as RNModal,
  TextInput,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {deviceWidth, hp, wp} from '../helper/constants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import {showMessage} from 'react-native-flash-message';
import DocumentPicker from 'react-native-document-picker';
import {routes} from '../navigation/Routes';
import {navigate} from '../navigation/rootNavigator';
import BottomSheetCondition from '../common/BottomSheetCondition';
import axios from 'axios';
import Colors from '../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../helper/ApiConstant';
import Icons from '../common/Icons';
import Video from 'react-native-video';
import Loader from '../common/Loader';

const OtherUserProfileScreen = () => {
  const navigation = useNavigation();
  const textInputRef = useRef(null);
  const route = useRoute();
  const otherUserId = route.params?.UserID;
  const type = route.params?.type;
  const {t} = useTranslation();

  const [token, setToken] = useState();
  const [loginUserID, setLoginUserID] = useState();
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isIsSocialPostList, setIsSocialPostList] = useState([]);
  const [isSocialPostuserData, setIsSocialPostuserData] = useState('');
  const [isUserId, setUserId] = useState('');
  const [isPhotos, setIsPhotos] = useState([]);
  const [isCommentList, setIsCommentList] = useState([]);
  const [isCommentText, setCommentText] = useState('');
  const [isPostIdForComment, setPostIdForComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [isuserData, setUserData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShowRemoveButton, showRemoveButton] = useState(false);
  const [followStatus, setFollowStatus] = useState('');

  useEffect(() => {
    gotosaveToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getSocialPostList();
      };
      onScreenFocus();
    }, [getSocialPostList]),
  );

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };

    fetchUserId();
  }, []);

  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId !== null) {
        return userId;
      }
    } catch (error) {
      console.error('Error fetching User ID:', error);
    }
  };

  const gotosaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
  };

  const FullScreenImageViewer = ({
    isVisible,
    images,
    currentIndex,
    onClose,
  }) => {
    return (
      <RNModal
        animationType="fade"
        transparent={false}
        visible={isVisible}
        style={{backgroundColor: 'red'}}>
        <Carousel
          data={images}
          renderItem={({item}) => (
            <Image
              source={{uri: item.uri}}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          sliderWidth={deviceWidth}
          itemWidth={wp(65)}
          firstItem={currentIndex}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Image source={icons.closeBtn} style={styles.closeButtonModal} />
        </TouchableOpacity>
      </RNModal>
    );
  };

  const PostCard = ({
    post = {},
    toggleCommentSheet,
    onPressLikeBtn,
    isUserDataInfo,
  }) => {
    const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

    const mediaItems =
      post.attachments && post.attachments.length > 0
        ? post.attachments.map(attachment => ({
            type: attachment.file_type.startsWith('image/') ? 'image' : 'video',
            uri: `${IMAGE_URL}${attachment.file_path}`,
          }))
        : post.background_image
        ? [{type: 'image', uri: `${IMAGE_URL}${post.background_image}`}]
        : [];

    const renderMedia = ({item, index}) => {
      if (item?.type === 'image') {
        return (
          <Pressable onPress={() => setIsFullScreenVisible(true)}>
            <Image
              source={{uri: item?.uri}}
              style={{height: hp(30), width: '92%', borderRadius: 15}} // Adjust the width for better UI
              key={index}
            />
          </Pressable>
        );
      } else if (item?.type === 'video') {
        return (
          <View
            style={{
              height: hp(30),
              width: '90%',
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
      <View style={styles.card}>
        {post.attachments.length === 0 ? (
          <View style={styles.plainViewContainer}>
            <Text style={styles.plainViewText}>{post.content}</Text>
          </View>
        ) : (
          <>
            <Carousel
              data={mediaItems}
              renderItem={renderMedia}
              sliderWidth={deviceWidth}
              itemWidth={deviceWidth}
              onSnapToItem={index => setActiveIndex(index)} // Update active index on snap
            />

            {mediaItems?.length > 1 && (
              <View style={styles.pagination}>
                {mediaItems.map((_, index) => (
                  <View
                    key={index}
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
          images={mediaItems.filter(item => item.type === 'image')}
          currentIndex={activeIndex}
          onClose={() => setIsFullScreenVisible(false)}
        />

        <View style={styles.detailsContainer}>
          <View style={styles.dotContainer}>
            <Pressable>
              <Text style={styles.username}>{isUserDataInfo}</Text>
            </Pressable>
          </View>
          <Text style={styles.time}>
            {post.created_at_hrf} {post.suggestedText}
          </Text>
          <Text style={styles.tag}>{post.content}</Text>

          <View style={styles.interactionRow}>
            <TouchableOpacity style={styles.iconRow} onPress={onPressLikeBtn}>
              <Image
                source={
                  post.is_liked === true ? icons.heartFill : icons.heartFill
                }
                style={styles.likeicon}
              />
              <Text style={styles.countsText}>{post.total_likes}</Text>
            </TouchableOpacity>
            <View style={styles.commentRow}>
              <Pressable onPress={toggleCommentSheet}>
                <Image source={icons.heartFill} style={styles.commentIcon} />
              </Pressable>
              <Text style={styles.countsText}>{post.total_comments}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getUserData = useCallback(async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'profile', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          setLoginUserID(res.data?.id);
          setUserData(res.data);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const getSocialPostList = useCallback(async () => {
    try {
      setIsLoading(true);
      const Token = await AsyncStorage.getItem('accessToken');
      var url = `${BASE_URL}posts_by_user/`;
      if (loginUserID == otherUserId) {
        url = url + otherUserId;
      } else {
        url = url + otherUserId + `?utype=${type}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
      });
      const res = await response.json();
      if (res.status === true) {
        setFollowStatus(res.data.follow_status);
        setIsSocialPostList(res.data.posts);
        setIsSocialPostuserData(res.data.user);
      } else {
        handleApiError(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [otherUserId]);

  const LikePost = async ID => {
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

      // Ensure isCommentText contains the value before appending
      if (isCommentText) {
        formData.append('content', isCommentText);
      }

      if (parentId) {
        formData.append('parent_id', parentId);
      }

      if (isPhotos && isPhotos.length > 0) {
        isPhotos.forEach((image, index) => {
          formData.append('attachments[]', {
            uri: image.uri, // Accessing the image properties directly
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
          GetCommentList(isPostIdForComment);
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const SendFollowRequest = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();
    formData.append('following_type', type);
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

  const UnfollowUser = async otherUserId => {
    var Token = await AsyncStorage.getItem('accessToken');

    await fetch(BASE_URL + 'social_unfollow/' + otherUserId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
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
      // setIsPhotos(prevDocuments => [...prevDocuments, ...newDocuments]);
      // PostComment(isPostIdForComment);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      }
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
      textInputRef.current?.focus();
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
                  item.is_liked === true ? icons.heartFill : icons.heartFill
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

  const renderEmptyComponent = () => (
    <Text style={styles.noDataText}>{t('otheruserprofile.noPostFound')}</Text>
  );

  const toggleCommentSheet = ID => {
    GetCommentList(ID);
    setIsCommentSheetOpen(!isCommentSheetOpen);
  };

  const gotoSendMessage = async () => {
    createConversionID();
  };

  const createConversionID = () => {
    const data = {
      to_id: otherUserId,
      to_type: type,
    };
    axios({
      method: 'post',
      url: BASE_URL + `conversations`,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        setIsLoading(false);
        if (response.data.status) {
          navigate(routes.MessageScreen, {ID: response.data.data.id});
        }
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.subHeader}>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.pressable}>
            <ImageBackground
              resizeMode="cover"
              source={icons.Bg}
              style={styles.imageBackground}>
              <Image
                resizeMode="contain"
                source={icons.backIcon}
                style={styles.backIcon}
              />
            </ImageBackground>
          </Pressable>
        </View>
      </View>
      <View style={styles.divider} />
      <ScrollView>
        <View style={styles.profileMainContainer}>
          <View style={styles.profileImageWrapper}>
            {isSocialPostuserData?.profile_image ? (
              <Image
                source={{
                  uri: IMAGE_URL + isSocialPostuserData?.profile_image,
                }}
                style={styles.profileImage}
              />
            ) : (
              <Image source={icons.dummyUser} style={styles.profileImage} />
            )}
          </View>
        </View>
        <View style={styles.badges}>
          <Text style={styles.name}>{isSocialPostuserData?.name}</Text>
          <Image
            resizeMode="contain"
            source={icons.heartFill}
            style={styles.certifiedIcon}
          />
          <Image
            resizeMode="contain"
            source={icons.heartFill}
            style={styles.badgeIcon}
          />
        </View>
        <Text style={styles.followText}>
          {isSocialPostuserData?.social_followers_count}{' '}
          {t('otheruserprofile.followers')} {' | '}
          {isSocialPostuserData?.social_following_count}{' '}
          {t('otheruserprofile.following')}
        </Text>
        {isSocialPostuserData?.id != isUserId && (
          <View style={styles.followBtnMainContainer}>
            {followStatus === 'request_sent' ? (
              <View style={styles.followBtnContainer}>
                <Icons
                  iconSetName={'FontAwesome6'}
                  iconName={'user-check'}
                  iconColor={Colors.white}
                  iconSize={18}
                />
                <Text style={[styles.followBtntext, {marginLeft: 10}]}>
                  {'Request Sent'}
                </Text>
              </View>
            ) : followStatus === 'following' ? (
              <View style={styles.followBtnContainer}>
                <Icons
                  iconSetName={'FontAwesome6'}
                  iconName={'user-check'}
                  iconColor={Colors.white}
                  iconSize={18}
                />
                <Text style={[styles.followBtntext, {marginLeft: 10}]}>
                  {'Following'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.followBtnContainer}
                onPress={() => {
                  SendFollowRequest();
                }}>
                <Icons
                  iconSetName={'FontAwesome6'}
                  iconName={'user-plus'}
                  iconColor={Colors.white}
                  iconSize={18}
                />
                <Text style={[styles.followBtntext, {marginLeft: 10}]}>
                  {'Follow'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.messageBtnContainer}
              onPress={() => gotoSendMessage()}>
              <Icons
                iconSetName={'Ionicons'}
                iconName={'chatbubbles-sharp'}
                iconColor={Colors.black}
                iconSize={20}
              />
              <Text style={[styles.messageBtntext, {marginLeft: 10}]}>
                {t('otheruserprofile.message')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.divider, {marginTop: 10}]} />
        <Text style={styles.postText}>
          {isSocialPostuserData?.name} {t('otheruserprofile.posts')}
        </Text>
        {!isLoading && (
          <>
            {isIsSocialPostList.length > 0 ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={isIsSocialPostList}
                keyExtractor={item => item.id}
                ListEmptyComponent={renderEmptyComponent}
                style={{marginHorizontal: 15}}
                renderItem={({item}) => {
                  return (
                    <PostCard
                      post={item}
                      userID={isUserId}
                      toggleCommentSheet={() => {
                        setPostIdForComment(item.id);
                        setIsPhotos('');
                        toggleCommentSheet(item.id);
                      }}
                      onPressLikeBtn={() => {
                        LikePost(item.id);
                      }}
                      isUserDataInfo={isSocialPostuserData.name}
                    />
                  );
                }} // Pass toggleCommentSheet as a prop
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.noDataText}>
                  {t('otheruserprofile.noPostFound')}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      {isCommentSheetOpen && (
        <BottomSheetCondition
          maxHeight={hp(65)}
          isOpen={isCommentSheetOpen}
          onClose={toggleCommentSheet}
          renderContent={() => {
            return (
              <>
                <Text style={styles.commentMainTitleText}>
                  {t('otheruserprofile.comments')}
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
                  {isuserData.profile_image ? (
                    <Image
                      source={{uri: IMAGE_URL + isuserData.profile_image}}
                      style={styles.commentInputAvatar}
                    />
                  ) : (
                    <Image
                      source={icons.demoUser}
                      style={styles.commentInputAvatar}
                    />
                  )}

                  <TextInput
                    ref={textInputRef}
                    value={isCommentText}
                    style={styles.commentInput}
                    placeholder={
                      replyingTo
                        ? t('otheruserprofile.writeAReply')
                        : t('otheruserprofile.addAComment')
                    }
                    placeholderTextColor={Colors.lightPlaceholder}
                    onChangeText={setCommentText}
                  />
                  <Pressable
                    onPress={() => {
                      PickPhotos();
                    }}>
                    <Image
                      source={icons.heartFill}
                      style={styles.AttchmentIcon}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      // PostComment(isPostIdForComment);
                      PostComment(isPostIdForComment, replyingTo);
                    }}>
                    <Image
                      source={icons.heartFill}
                      style={styles.sendMessageIcon}
                    />
                  </Pressable>
                </View>
              </>
            );
          }}
        />
      )}
      {isLoading && <Loader />}
    </View>
  );
};
export default OtherUserProfileScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    height: hp(4.8),
    width: hp(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  backIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
  },
  cameraIcon: {
    height: 40,
    width: 40,
  },
  divider: {
    width: '100%',
    backgroundColor: 'lightgray',
    height: 2,
    marginBottom: 10,
  },
  profileMainContainer: {
    alignItems: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: hp(9),
    height: hp(9),
    borderRadius: 100,
  },
  cameraIconWrapper: {
    position: 'absolute',
    right: -10,
    bottom: 10,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(2.35),
    marginLeft: '15%',
  },
  badges: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  badgeIcon: {
    height: hp(2.7),
    width: hp(2.7),
    marginLeft: 5,
    resizeMode: 'contain',
  },
  followContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  peopleIcon: {
    height: hp(2.7),
    width: hp(2.7),
    resizeMode: 'contain',
    marginRight: wp(4.2),
  },
  AddFollowicon: {
    height: hp(2.7),
    width: hp(2.7),
    resizeMode: 'contain',
    marginRight: 9,
  },
  editPencilBlueIcon: {
    height: hp(2.7),
    width: hp(2.7),
    resizeMode: 'contain',
    marginLeft: 10,
  },
  certifiedIcon: {
    height: hp(2.7),
    width: hp(2.7),
    marginLeft: 5,
    resizeMode: 'contain',
  },
  followStats: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 15,
  },
  infoText: {
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.88),
  },
  followBtntext: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.41),
  },
  messageBtntext: {
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.41),
  },
  followText: {
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.64),
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 10,
  },
  postText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    marginHorizontal: 16,
    marginBottom: 10,
  },
  detailsText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    marginHorizontal: 16,
    marginBottom: 16,
  },
  //   Post style
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
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
  },

  /////
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
    marginVertical: 5,
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
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
    borderTopWidth: 1,
    borderTopColor: '#ccc',
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
  likeicon: {
    height: hp(2.8),
    width: hp(2.8),
    resizeMode: 'contain',
    // marginHorizontal: 7,
  },
  commentIcon: {
    height: hp(2.8),
    width: hp(2.8),
    resizeMode: 'contain',
    // marginHorizontal: 7,
  },
  horizontalThreeDotIcon: {
    height: 4,
    width: 18,
    resizeMode: 'contain',
  },
  followBtnMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: hp(1.9),
  },
  followBtnContainer: {
    backgroundColor: '#754595',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    flex: 0.48,
  },
  messageBtnContainer: {
    backgroundColor: '#CECECE',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    flex: 0.48,
  },
  commentLikeicon: {
    height: hp(2.3),
    width: hp(2.3),
    resizeMode: 'contain',
  },
  plainViewText: {
    color: '#000000',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Nunito-SemiBold',
    padding: 15,
  },
  plainViewContainer: {
    height: hp(15),
    width: deviceWidth,
    backgroundColor: '#FAF9F6',
    marginBottom: 4,
  },
  trashicon: {
    height: 20,
    width: 20,
  },
  removeText: {
    fontSize: responsiveFontSize(1.41),
    color: '#1D1D1D',
    fontFamily: 'Nunito-Medium',
    marginLeft: 5,
  },
  removePostBtnContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
    position: 'absolute',
    right: -20,
    top: 0,
    height: 40,
    width: 80,
    zIndex: 999,
    justifyContent: 'center',
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
    marginBottom: 10,
  },
  commentAttchImage: {
    height: 60,
    width: 60,
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 3,
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
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
