import axios from 'axios'
import { showError } from './alertActions'

export const authAction = {
  SIGN_IN: 'signIn',
  SIGN_OUT: 'signOut',
  AUTH_LOADED: 'authLoaded',
  AUTH_FAILED: 'authFailed',
  LOAD_TOKEN: 'loadToken',
  UPDATE_USER: 'updateUser'
}

export const updateUser = (user) => ({
  type: authAction.UPDATE_USER,
  user
})

export const signIn = (user, token) => ({
  type: authAction.SIGN_IN,
  user,
  token
})
export const signOut = () => {
  localStorage.removeItem('token')
  return { type: authAction.SIGN_OUT }
}

export const loadAuth = () => {
  return (dispatch, getState) => {
    const token = localStorage.getItem('token')
    dispatch({
      type: authAction.LOAD_TOKEN,
      token: token ? token : null
    })

    axios
      .get('api/users/profile')
      .then(({ data }) => {
        dispatch({
          type: authAction.AUTH_LOADED,
          user: data.user
        })
      })
      .catch((err) => {
        if (token) dispatch(showError(err.message))
      })
  }
}
