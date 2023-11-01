import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51O7ZF7GCR7hQJ79Cm5LMdBUkyBii6ZQPbetwqecfiQYoq4XynnTnsvgc78WcpbIoJd8AeHupiwPyIY2tHTm69V7900zGlNC50U'
);

export const bookTour = async (tourId) => {
  try {
    //1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);

    //2) Create checkout from + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
