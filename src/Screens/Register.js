// Register.js
import { trackUserRegistration } from '../utils/analytics';
import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { Input } from "../Components/Usedinputs";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { InlineError } from "../Components/Notifications/Error";
import toast from "react-hot-toast";
import { registerAction } from "../Redux/Actions/userActions";
import { RegisterValidation } from "../Components/Validation/UserValidation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";


function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [image] = useState('');
  const { isLoading, isError, userInfo, isSuccess } = useSelector(
    (state) => state.userRegister
  );

  // Validate user
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterValidation),
  });

  // On submit
  const onSubmit = (data) => {
    dispatch(registerAction({ ...data, image }));
    if (isSuccess) {
  trackUserRegistration('email');
  toast.success(`Welcome ${userInfo?.fullName}`);
  dispatch({ type: "USER_REGISTER_RESET" });
}
  };

  

  // useEffect
  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate("/dashboard");
    } else if (userInfo) {
      navigate("/profile");
    }

    if (isSuccess) {
      toast.success(`Welcome ${userInfo?.fullName}`);
      dispatch({ type: "USER_REGISTER_RESET" });
    }

    if (isError) {
      toast.error(isError);
      dispatch({ type: "USER_REGISTER_RESET" });
    }
  }, [userInfo, isSuccess, isError, navigate, dispatch]);

  return (
    <Layout>
      <div className="container mx-auto px-2 flex-colo min-h-[calc(100vh-200px)] py-3">
        <form
          onSubmit={handleSubmit(onSubmit)} 
          className="w-full 2xl:w-2/5 md:w-3/5 above-1000:w-[450px] above-1000:max-w-[450px] gap-6 above-1000:gap-5 p-8 sm:p-14 above-1000:p-10 bg-dry rounded-lg border border-border shadow-xl">
          <img
            src="/images/MOVIEFROST.png"
            alt="logo"
            className="w-full h-12 above-1000:h-10 object-contain mb-6 above-1000:mb-4"
          />
          
          <h2 className="text-center text-xl above-1000:text-lg font-bold text-white text-opacity-90 mb-6 above-1000:mb-4">
            Create Your Free Account
          </h2>
          
          <div className="w-full">
            <Input
              label="Full Name"
              placeholder="Full Name"
              type="text"
              bg={true}
              name="fullName"
              register={formRegister("fullName")}
            />
            {errors.fullName && <InlineError text={errors.fullName.message} />}
          </div>
          <div className="w-full">
            <Input
              label="Email"
              placeholder="Your Email"
              type="email"
              name="email"
              register={formRegister("email")}
              bg={true}
            />
            {errors.email && <InlineError text={errors.email.message} />}
          </div>
          <div className="w-full">
            <Input
              label="Password"
              placeholder="******"
              type="password"
              bg={true}
              name="password"
              register={formRegister("password")}
            />
            {errors.password && <InlineError text={errors.password.message} />}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-customPurple transitions hover:bg-main flex-rows mt-6 mb-4 above-1000:mt-5 above-1000:mb-3 gap-4 text-white font-semibold p-4 above-1000:p-3 rounded-lg w-full"
          >
            { 
              // if loading show loading 
              isLoading ? (
                "Loading..."
              ) : (
                <>
                  <FiLogIn /> Sign Up
                </>
              )
            }
          </button>
          <p className="text-center text-border text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-customPurple font-semibold ml-2 hover:underline">
              Sign In
            </Link>
          </p>    
        </form>
      </div>
    </Layout>
  );
}

export default Register;
