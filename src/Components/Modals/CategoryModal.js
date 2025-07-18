import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategoryAction, updateCategoryAction } from '../../Redux/Actions/CategoriesActions';
import toast from 'react-hot-toast';
import * as CategoriesConstants from '../../Redux/Constants/CategoriesConstants';

function CategoryModal({ isOpen, onClose, category }) {
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (category) {
      setCategoryName(category.title);
    } else {
      setCategoryName('');
    }
  }, [category]);

  const dispatch = useDispatch();

  // Get states from categoryCreate and categoryUpdate reducers
  const { isLoading, isError, isSuccess } = useSelector(
    (state) => state.categoryCreate
  );
  const {
    isLoading: upLoading,
    isError: upError,
    isSuccess: upSuccess,
  } = useSelector((state) => state.categoryUpdate);

  // Handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    if (categoryName) {
      if (category) {
        dispatch(updateCategoryAction(category._id, { title: categoryName }));
      } else {
        dispatch(createCategoryAction({ title: categoryName }));
      }
      onClose();
    } else {
      toast.error('Please write a category name');
    }
  };

  // Handle effects for success and error messages
  useEffect(() => {
    if (isError || upError) {
      toast.error(isError || upError);
      dispatch({
        type: isError ? CategoriesConstants.CREATE_CATEGORY_RESET : CategoriesConstants.UPDATE_CATEGORY_RESET,
      });
    }

    if (isSuccess || upSuccess) {
      dispatch({
        type: isSuccess ? CategoriesConstants.CREATE_CATEGORY_RESET : CategoriesConstants.UPDATE_CATEGORY_RESET,
      });
    }
  }, [dispatch, isError, isSuccess, upError, upSuccess]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay and modal content */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-[#1a1d29] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-white mb-6"
                >
                  {category ? 'Update' : 'Create Category'}
                </Dialog.Title>

                <form onSubmit={submitHandler} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full p-3 bg-[#131720] border border-gray-700 rounded-md text-white focus:outline-none focus:border-gray-600"
                      placeholder="Action"
                      required
                    />
                  </div>

                  <button
                    disabled={isLoading || upLoading}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-customPurple text-white rounded-md hover:bg-transparent border-2 border-customPurple transition-colors duration-200"
                  >
                    {isLoading || upLoading ? 'Loading...' : category ? 'Update' : 'Create'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CategoryModal;
