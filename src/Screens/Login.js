// Login.js
import { trackUserRegistration } from '../utils/analytics';
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../Layout/Layout";
import { Input } from "../Components/Usedinputs";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { LoginValidation } from "../Components/Validation/UserValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { InlineError } from "../Components/Notifications/Error";
import { loginAction, loginWithGoogleAction } from "../Redux/Actions/userActions";
import toast from "react-hot-toast";
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const { isLoading, isError, userInfo, isSuccess } = useSelector(
    (state) => state.userLogin
  );

  // Check if Google OAuth is properly configured
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== 'undefined') {
      setGoogleAuthEnabled(true);
    } else {
      console.warn('Google OAuth is not configured properly');
    }
  }, []);

  // ------------------------------------------------------------
  // Google Sign-In: keep everything inside a POP-UP so that the
  // browser never navigates away (=> no redirect_uri_mismatch)
  // ------------------------------------------------------------
  const login = useGoogleLogin({
    flow: 'implicit',          // we still want an access-token
    ux_mode: 'popup',         // <-- force popup mode
    onSuccess: ({ access_token }) => {
      trackUserRegistration('google');
      dispatch(loginWithGoogleAction(access_token));
    },
    onError: (error) => {
      console.error('Google Sign-In error:', error);
      toast.error(error.error_description || 'Google Sign-In failed');
    },
  });

  const handleGoogleSignIn = () => {
    if (!googleAuthEnabled) {
      toast.error('Google Sign-In is not available at the moment');
      return;
    }
    login();
  };

  // Validate user
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidation),
  });

  // On submit
  const onSubmit = (data) => {
    dispatch(loginAction(data));
  };

  // useEffect
  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate("/dashboard");
    } else if (userInfo) {
      // Check for redirect after login with scroll position
      const redirectStateStr = localStorage.getItem('redirectAfterLogin');
      if (redirectStateStr) {
        try {
          const redirectState = JSON.parse(redirectStateStr);
          localStorage.removeItem('redirectAfterLogin');
          
          // Navigate to the saved location
          const fullPath = redirectState.pathname + (redirectState.search || '') + (redirectState.hash || '');
          navigate(fullPath);
          
          // Restore scroll position after navigation
          setTimeout(() => {
            if (redirectState.scrollY && redirectState.scrollY > 0) {
              window.scrollTo(0, redirectState.scrollY);
            }
          }, 100);
        } catch (error) {
          console.error('Error parsing redirect state:', error);
          navigate("/profile");
        }
      } else {
        navigate("/profile");
      }
    }

    if (isSuccess) {  
      toast.success(`Welcome back ${userInfo?.fullName}`);
    }

    if (isError) {
      toast.error(isError);
      dispatch({ type: "USER_LOGIN_RESET" });
    }
  }, [userInfo, isSuccess, isError, navigate, dispatch]);

  return (
    <Layout>
      <div className="container mx-auto px-2 flex-colo min-h-[calc(100vh-200px)] py-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full md:w-3/5 2xl:w-2/5 above-1000:w-[450px] above-1000:max-w-[450px] gap-6 above-1000:gap-5 p-6 sm:p-14 above-1000:p-10 bg-dry rounded-lg border border-border shadow-xl"
        >
          <img
            src="/images/MOVIEFROST.png"
            alt="logo"
            className="w-full h-12 above-1000:h-10 object-contain mb-4"
          />
          {/* The additional line requested */}
          <div className="text-center mb-4 mt-2 text-sm font-semibold text-customPurple">
            Please Log In right now for Free
          </div>

          {/* Only show Google Sign In if properly configured */}
          {googleAuthEnabled && (
            <>
              <div
                className="flex items-center justify-center bg-customPurple rounded-lg shadow-md cursor-pointer transition-all duration-200 ease-in-out w-full hover:shadow-lg mb-4 above-1000:mb-3"
                onClick={handleGoogleSignIn}
              >
                <div className="py-2 px-4 flex items-center justify-center">
                  <img className="w-8 h-8 above-1000:w-6 above-1000:h-6" src="/images/google.png" alt="Google Logo" />
                </div>
                <p className="text-white font-semibold text-lg above-1000:text-base px-6">Sign In with Google</p>
              </div>
              
              <div className="flex items-center gap-4 my-6 above-1000:my-5">
                <div className="flex-grow h-px bg-border"></div>
                <span className="text-border text-sm">OR</span>
                <div className="flex-grow h-px bg-border"></div>
              </div>
            </>
          )}
          
          <div className="w-full">
            <Input
              label="Email"
              placeholder="Your Email"
              type="email"
              name="email"
              register={register("email")}
              bg={true}
            />
            {errors.email && <InlineError text={errors.email.message} />}
          </div>
          <div className="w-full">
            <Input
              label="Password"
              placeholder="*******"
              type="password"
              bg={true}
              name="password"
              register={register("password")}
            />
            {errors.password && <InlineError text={errors.password.message} />}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-customPurple transitions hover:bg-main flex-rows mt-6 mb-4 above-1000:mt-5 above-1000:mb-3 gap-4 text-white font-semibold p-4 above-1000:p-3 rounded-lg w-full"
          >
            {isLoading ? "Loading..." : <>
              <FiLogIn /> Sign In
            </>}
          </button>
          <p className="text-center text-border text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-customPurple font-semibold ml-2 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}

export default Login;
