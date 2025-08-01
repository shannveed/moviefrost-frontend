import React, { useEffect } from "react";
import { FaRegListAlt, FaUser } from "react-icons/fa";
import SideBar from "../SideBar";
import { HiViewGridAdd } from "react-icons/hi";
import Table from "../../../Components/Table";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersAction } from "../../../Redux/Actions/userActions";
import toast from "react-hot-toast";
import Loader from "../../../Components/Loader";
import { Empty } from "../../../Components/Notifications/Empty";
import { deleteMovieAction } from "../../../Redux/Actions/MoviesActions";
import { Helmet } from 'react-helmet-async';

function Dashboard() {
  const dispatch = useDispatch();
  
  // useSelectors
  const {
    isLoading: catLoading,
    isError: catError,
    categories,
  } = useSelector((state) => state.categoryGetAll);

  const {
    isLoading: userLoading,
    isError: userError,
    users,
  } = useSelector((state) => state.adminGetAllUsers);

  const { isLoading, isError, movies, totalMovies } = useSelector(
    (state) => state.getAllMovies
  );
  
  // delete
  const { isLoading: deleteLoading, isError: deleteError } = useSelector(
    (state) => state.deleteMovie
  );
  
  // delete movie handler
  const deleteMovieHandler = (id) => {
    window.confirm("Are you sure you want to delete this movie?") &&
      dispatch(deleteMovieAction(id));
  };
  
  // useEffect
  useEffect(() => {
    // get all users
    dispatch(getAllUsersAction());
    // errors
    if (isError || catError || userError || deleteError) {
      toast.error("Something went wrong!");
    }
  }, [dispatch, isError, catError, userError, deleteError]);

  // Dashboard Datas
  const DashboardData = [ 
    {
      bg: "bg-orange-600",
      icon: FaRegListAlt,
      title: "Total Movies",
      total: isLoading ? "Loading..." : totalMovies || 0,
    },
    {
      bg: "bg-blue-700",
      icon: HiViewGridAdd,
      title: "Total Categories",
      total: catLoading ? "Loading..." : categories?.length || 0,
    },
    {
      bg: "bg-green-600",
      icon: FaUser,
      title: "Total Users",
      total: userLoading ? "Loading..." : users?.length || 0,
    },
  ];

  return (
    <SideBar>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex flex-col gap-6 above-1000:gap-4">
        <h2 className="text-xl font-bold above-1000:text-lg">Dashboard</h2>
        
        {/* Stats Grid - Optimized for above-1000 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 above-1000:gap-4 mt-4 above-1000:mt-2">
          {DashboardData.map((data, index) => (
            <div
              key={index}
              className="p-4 above-1000:p-3 rounded bg-main border-border grid grid-cols-4 gap-2"
            >
              <div
                className={`col-span-1 rounded-full h-12 w-12 above-1000:h-10 above-1000:w-10 flex-colo ${data.bg}`}
              >
                <data.icon className="above-1000:text-sm" />
              </div>
              <div className="col-span-3">
                <h2 className="text-sm above-1000:text-xs">{data.title}</h2>
                <p className="mt-2 above-1000:mt-1 font-bold text-lg above-1000:text-base">{data.total}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Movies Section */}
        <div className="mt-6 above-1000:mt-4">
          <h3 className="text-md above-1000:text-sm font-medium mb-4 above-1000:mb-3 text-border">
            Recent Movies
          </h3>
          
          {isLoading || deleteLoading ? (
            <Loader />
          ) : movies?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table 
                data={movies?.slice(0, 5)} 
                admin={true} 
                onDeleteHandler={deleteMovieHandler} 
              />
            </div>
          ) : (
            <Empty message="No movies found" />
          )}
        </div>
      </div>
    </SideBar>
  );
}

export default Dashboard;
