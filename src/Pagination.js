import React from "react";

export default function Pagination({
  postsPerPage,
  totalPosts,
  paginate,
  currentPage,
  isImages
}) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const getItemCount = () => {
    if (totalPosts < postsPerPage) {
      console.log(postsPerPage)
      console.log(totalPosts)
      return (
        <span className='font-medium'> {totalPosts} </span>
      )
    } else {
      if (currentPage == pageNumbers.length) {
        return (
          <span className='font-medium'> {totalPosts} </span>
        )
      } else {  
        return (
          <span className='font-medium'> {currentPage * postsPerPage} </span>
        )
      }      
    }
  }

  return (
    <div className='mb-8'>
      {!isImages &&
        <div className="mb-1">
          <p className='text-sm text-white'>
            Showing
            <span className='font-medium'>
              {" "}
              {/* {currentPage * postsPerPage}{" "} */}
              {currentPage === 1 ? currentPage : currentPage * postsPerPage - postsPerPage}{" "}
            </span>
            -
            {getItemCount()}       
            of
            <span className='font-medium'> {totalPosts} </span>
            properties
          </p>
        </div>
      }
      <nav className='block'>
        <ul className='flex pl-0 rounded list-none flex-wrap'>
          <li>
            {pageNumbers.map((number, i) => (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a key={number}
                onClick={() => {
                  paginate(number);
                }}
                href='#'
                className={
                  currentPage === number
                    ? "bg-blue border-red-300 text-red-500 hover:text-red-500 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    : "bg-transparent border-gray-300 text-gray-300 hover:text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                }
              >
                {number}
              </a>
            ))}
          </li>
        </ul>
      </nav>
    </div>
  );
}