import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './sign-up';
import { updateUser } from './updateSettings';
import { bookTour } from './stripe';

// DOM ELEMENTS
const loginForm = document.querySelector('.log-form');
const signForm = document.querySelector('.sign-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserDataForm = document.querySelector('.update-data-form');
const updateUserPasswordForm = document.querySelector('.update-password-form');
const bookBtn = document.getElementById('book-tour');

//
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

//
//
if (signForm)
  signForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    signup(name, email, password, passwordConfirm);
  });

//
//
if (logoutBtn) logoutBtn.addEventListener('click', logout);

//
//
if (updateUserDataForm)
  updateUserDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUser(form, 'data');
  });

//
//
if (updateUserPasswordForm)
  updateUserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUser(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

//
//
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
