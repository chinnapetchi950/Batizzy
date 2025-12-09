import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {showMessage} from 'react-native-flash-message';
import {hp} from '../helper/constants';
import {icons} from '../helper/imageConstants';
import Colors from '../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../helper/ApiConstant';

const SocialFollowRequestList = ({searchTerm}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingRequest, setIsPendingRequest] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await GetPendingRequest();
      };
      onScreenFocus();
    }, [GetPendingRequest]),
  );

  const GetPendingRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      const Token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `${BASE_URL}social_pending-follow-requests`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${Token}`,
            Accept: 'application/json',
          },
        },
      );
      const res = await response.json();

      if (res.status === true) {
        setIsPendingRequest(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ConfrimFollowRequest = async userID => {
    var Token = await AsyncStorage.getItem('accessToken');

    await fetch(BASE_URL + 'social_follow-request/' + userID + '/' + 'accept', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          AsyncStorage.setItem('accessToken', res.token);
          GetPendingRequest();
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const DeleteFollowRequest = async userID => {
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'social_follow-request/' + userID + '/' + 'reject', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          AsyncStorage.setItem('accessToken', res.token);
          GetPendingRequest();
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
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

  const renderItem = ({item}) => {
    return (
      <View style={styles.listItem}>
        {item?.requester?.profile_image != null ? (
          <Image
            source={{uri: IMAGE_URL + item?.requester?.profile_image}}
            style={styles.avatar}
          />
        ) : (
          <Image source={icons.dummyUser} style={styles.avatar} />
        )}

        <Text style={styles.name}>{item?.requester?.name}</Text>
        <Pressable
          style={styles.confirmButton}
          onPress={() => {
            ConfrimFollowRequest(item?.id);
          }}>
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            DeleteFollowRequest(item.id);
          }}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  // Filter data based on search term
  const filteredFollowers = isPendingRequest.filter(follower =>
    follower.requester.name
      ?.toLowerCase()
      .includes((searchTerm || '').toLowerCase()),
  );

  return (
    <>
      {!isLoading && (
        <>
          {filteredFollowers.length > 0 ? (
            <FlatList
              data={filteredFollowers}
              keyExtractor={item => item.id}
              renderItem={renderItem}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>No Data Found</Text>
            </View>
          )}
        </>
      )}
      {isLoading && (
        <Modal isVisible={isLoading} style={styles.modalContainer}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={'small'} color={Colors.primary} />
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  avatar: {
    width: hp(4.6),
    height: hp(4.6),
    borderRadius: 20,
    marginRight: 16,
  },
  name: {
    flex: 1,
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(2.35),
  },
  confirmButton: {
    backgroundColor: '#754595',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#9D9D9D9C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
  },
  deleteText: {
    color: '#1D1D1D',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
  },
  menuButton: {
    marginLeft: 10,
  },
  menuText: {
    fontSize: 24,
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
});

export default SocialFollowRequestList;
