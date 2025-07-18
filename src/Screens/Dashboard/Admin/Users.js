import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Table2 from "../../../Components/Table2";
import SideBar from "../SideBar";
import { deleteUserAction, getAllUsersAction } from "../../../Redux/Actions/userActions";
import toast from "react-hot-toast";
import Loader from "../../../Components/Loader";
import { Empty } from "../../../Components/Notifications/Empty";

function Users() {
  const dispatch = useDispatch();

  const { isLoading, isError, users } = useSelector(
    (state) => state.adminGetAllUsers
  );
  
  const { isError: deleteError, isSuccess } = useSelector(
    (state) => state.adminDeleteUser
  );
  
  const deleteMoviesHandler = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUserAction(id));
    }
  };

  useEffect(() => {
    dispatch(getAllUsersAction());
    if (isError || deleteError) {
      toast.error(isError || deleteError);
      dispatch({
        type: isError
          ? "GET_ALL_USERS_RESET"
          : "DELETE_USER_RESET",
      });
    }
  }, [dispatch, isError, deleteError, isSuccess]);

  return (
    <SideBar>
      <div className="flex flex-col gap-6 above-1000:gap-4">
        <h2 className="text-xl font-bold above-1000:text-lg">Users</h2>
        {isLoading ? (
          <Loader />
        ) : users?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table2 
              data={users} 
              users={true} 
              onDeleteFunction={deleteMoviesHandler} 
            />
          </div>
        ) : (
          <Empty message="You dont have any user" />
        )}
      </div>
    </SideBar>
  );
}

export default Users;
