import React, { useEffect, useState } from "react";
import SideBar from "./SideBar";
import Uploader from "../../Components/Uploader";
import { Input } from "../../Components/Usedinputs";
import { useDispatch, useSelector } from "react-redux";
import { ProfileValidation } from "../../Components/Validation/UserValidation";
import { InlineError } from "../../Components/Notifications/Error";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { deleteProfileAction, updateProfileAction } from "../../Redux/Actions/userActions";
import toast from "react-hot-toast";
import { Imagepreview } from "../../Components/imagePreview";
import { Helmet } from 'react-helmet-async';

function Profile() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLogin);
  const { isLoading, isError, isSuccess } = useSelector(
    (state) => state.userUpdateProfile
  );
  const { isLoading: deleteLoading, isError: deleteError } = useSelector(
    (state) => state.userDeleteProfile
  );

  const [image, setImage] = useState(userInfo?.image || '');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ProfileValidation),
  });

  const onSubmit = (data) => {
    dispatch(updateProfileAction({ ...data, image }));
  };

  const deleteProfile = () => {
    window.confirm("Are you sure you want to delete your profile?") &&
      dispatch(deleteProfileAction());
  };

  useEffect(() => {
    if (userInfo) {
      setValue("fullName", userInfo?.fullName);
      setValue("email", userInfo?.email);
      setImage(userInfo?.image || '');
    }
    if (isSuccess) {
      dispatch({ type: "USER_UPDATE_PROFILE_RESET" });
    }
    if (isError || deleteError) {
      toast.error(isError || deleteError);
      dispatch({ type: "USER_UPDATE_PROFILE_RESET" });
      dispatch({ type: "USER_DELETE_PROFILE_RESET" });
    }
  }, [userInfo, setValue, isSuccess, isError, dispatch, deleteError]);
  
  return (
    <SideBar>
      {/* Add no-index meta */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 above-1000:gap-4">
        <h2 className="text-xl font-bold above-1000:text-lg">Profile</h2>
        
        {/* Image Uploader */}
        <div className="flex flex-col gap-2">
          <p className="text-border font-semibold text-sm above-1000:text-xs">Profile Image</p>
          <Uploader setImageUrl={setImage} />
          {image && (
            <Imagepreview image={image} name="profileImage" />
          )}
        </div>
        
        {/* Full Name */}
        <div className="w-full">
          <Input
            label="Full Name"
            placeholder="fullname"
            type="text"
            bg={true}
            name="fullName"
            register={register("fullName")}
          />
          {errors.fullName && <InlineError text={errors.fullName.message} />}
        </div>
        
        {/* Email */}
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
        
        {/* Buttons */}
        <div className="flex gap-2 above-1000:gap-3 flex-wrap flex-col-reverse sm:flex-row justify-between items-center my-4 above-1000:my-3">
          <button 
            onClick={deleteProfile}
            disabled={deleteLoading || isLoading}
            className="bg-customPurple font-medium transitions hover:bg-main border border-customPurple text-white py-3 px-6 above-1000:py-2 above-1000:px-4 rounded w-full sm:w-auto text-base above-1000:text-sm"
          >
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
          <button 
            disabled={deleteLoading || isLoading}
            className="bg-main font-medium transitions hover:bg-customPurple border border-customPurple text-white py-3 px-6 above-1000:py-2 above-1000:px-4 rounded w-full sm:w-auto text-base above-1000:text-sm"
          >
            {isLoading ? "Updating..." : "Update"}
          </button>  
        </div>
      </form>
    </SideBar>
  );
}

export default Profile;
