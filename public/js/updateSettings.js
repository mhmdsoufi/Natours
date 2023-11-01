import axios from 'axios';
import { showAlert } from './alert';

export const updateUser = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'Patch',
      url,
      data,
    });

    if (res.data.status === 'success') {
      location.reload(true);
      showAlert('success', `${type.toUpperCase()} updated successfully!!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
