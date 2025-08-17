import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <>
      <div className="flex justify-center items-center w-full h-screen">
        <div className="flex flex-col justify-center items-center w-full h-screen">
          <p className="text-4xl ">Error: 404</p>
          <p className="text-3xl ">This page doesn't exist</p>
          <p className="text-2xl pt-4">
            Back to
            <Link to="/home" className="underline underline-offset-4 pl-2">
              home
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;
