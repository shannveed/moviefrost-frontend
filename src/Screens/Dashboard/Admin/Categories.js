  import React, { useState, useEffect } from 'react';
  import { HiPlusCircle } from 'react-icons/hi';
  import SideBar from '../SideBar';
  import CategoryModal from '../../../Components/Modals/CategoryModal';
  import Table2 from '../../../Components/Table2';
  import {  deleteCategoryAction } from '../../../Redux/Actions/CategoriesActions';
  import { useDispatch, useSelector } from 'react-redux';
  import { Empty } from '../../../Components/Notifications/Empty';
  import Loader from '../../../Components/Loader';
  import { Helmet } from 'react-helmet-async';

  function Categories() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const dispatch = useDispatch();

    // Fetch categories when component mounts or when actions succeed
    useEffect(() => {
    }, [dispatch]);

    // Get categories and loading state
    const { categories, isLoading } = useSelector(
      (state) => state.categoryGetAll
    );

    // Delete category handler
    const adminDeleteCategory = (id) => {
      if (window.confirm('Are you sure you want to delete this category?')) {
        dispatch(deleteCategoryAction(id));
      }
    };

    // Handler for edit button click
    const handleEditClick = (category) => {
      setSelectedCategory(category);
      setModalOpen(true);
    };

    return (
      <SideBar>
        <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
        {modalOpen && (
          <CategoryModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
          />
        )}
        <div className="flex flex-col gap-6">
          {/* Header section with Create button */}
          <div className="flex-btn gap-2">
            <h2 className="text-xl font-bold">Categories</h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setModalOpen(true);
              }}
              className="bg-customPurple flex-rows gap-4 font-medium transitions hover:bg-main border border-customPurple text-white py-2 px-4 rounded"
            >
              <HiPlusCircle /> Create
            </button>
          </div>
          {isLoading ? (
            <Loader />
          ) : categories?.length > 0 ? (
            <Table2
              data={categories}
              users={false}
              onEdit={handleEditClick}
              onDeleteFunction={adminDeleteCategory}
            />
          ) : (
            <Empty message="You have no categories" />
          )}
        </div>
      </SideBar>
    );
  }

  export default Categories;
