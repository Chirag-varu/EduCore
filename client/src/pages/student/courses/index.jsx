import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDownIcon, Filter, X, BookOpen, Clock, BarChart3 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  // Count active filters
  const activeFilterCount = Object.values(filters).reduce(
    (count, arr) => count + (arr?.length || 0),
    0
  );

  function clearAllFilters() {
    setFilters({});
    sessionStorage.removeItem("filters");
  }

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSeection =
      Object.keys(cpyFilters).indexOf(getSectionId);

    console.log(indexOfCurrentSeection, getSectionId);
    if (indexOfCurrentSeection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption.id],
      };

      console.log(cpyFilters);
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  async function fetchAllStudentViewCourses(filters, sort) {
    const query = new URLSearchParams({
      ...filters,
      sortBy: sort,
    });
    const response = await fetchStudentViewCourseListService(query);
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
      setLoadingState(false);
    }
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }
  
  // Function to check if student is enrolled in a course
  async function checkEnrollmentStatus(courseId) {
    if (auth?.user?._id) {
      try {
        const response = await checkCoursePurchaseInfoService(
          courseId,
          auth.user._id
        );
        return response?.success && response?.data;
      } catch (error) {
        console.error("Error checking enrollment status:", error);
        return false;
      }
    }
    return false;
  }

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort);
  }, [filters, sort]);
  
  // Check enrollment status for all courses
  async function fetchEnrollmentStatuses(courses) {
    if (!auth?.user?._id || !courses?.length) return;
    
    const statuses = {};
    
    for (const course of courses) {
      try {
        const isEnrolled = await checkEnrollmentStatus(course._id);
        statuses[course._id] = isEnrolled;
      } catch (error) {
        console.error(`Error checking enrollment for course ${course._id}:`, error);
      }
    }
    
    setEnrolledCourses(statuses);
  }
  
  // Update enrollment statuses when course list changes
  useEffect(() => {
    if (studentViewCoursesList && studentViewCoursesList.length > 0) {
      fetchEnrollmentStatuses(studentViewCoursesList);
    }
  }, [studentViewCoursesList, auth?.user?._id]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  console.log(loadingState, "loadingState");

  // Filter content component (reused in sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-2" />
          Clear all filters ({activeFilterCount})
        </Button>
      )}
      {Object.keys(filterOptions).map((keyItem) => (
        <div className="space-y-3" key={keyItem}>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {keyItem}
          </h3>
          <div className="space-y-2">
            {filterOptions[keyItem].map((option) => (
              <Label 
                className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors" 
                key={option.id}
              >
                <Checkbox
                  checked={
                    filters &&
                    Object.keys(filters).length > 0 &&
                    filters[keyItem] &&
                    filters[keyItem].indexOf(option.id) > -1
                  }
                  onCheckedChange={() =>
                    handleFilterOnChange(keyItem, option)
                  }
                />
                <span className="text-sm font-medium">{option.label}</span>
              </Label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 md:py-4">
          {/* <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight">
            Explore Courses
          </h1> */}
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Discover courses that will help you grow your skills
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4 bg-card rounded-lg border p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-card rounded-lg border p-3 md:p-4">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Results Count */}
              <span className="text-sm text-muted-foreground order-last sm:order-none w-full sm:w-auto text-center sm:text-left">
                <span className="font-semibold text-foreground">{studentViewCoursesList.length}</span> courses found
              </span>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto lg:ml-0">
                    <ArrowUpDownIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sort By</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuRadioGroup
                    value={sort}
                    onValueChange={(value) => setSort(value)}
                  >
                    {sortOptions.map((sortItem) => (
                      <DropdownMenuRadioItem
                        value={sortItem.id}
                        key={sortItem.id}
                        className="cursor-pointer"
                      >
                        {sortItem.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Course Grid */}
            {loadingState ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full h-40 md:h-48" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {studentViewCoursesList.map((courseItem) => (
                  <Card
                    onClick={() => handleCourseNavigate(courseItem?._id)}
                    className="cursor-pointer group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    key={courseItem?._id}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={courseItem?.thumbnail}
                        alt={courseItem?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {enrolledCourses[courseItem?._id] && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Enrolled
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <CardTitle className="text-base md:text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {courseItem?.title}
                      </CardTitle>

                      {/* Instructor */}
                      <p className="text-sm text-muted-foreground mb-3">
                        By{" "}
                        <Link
                          to={`/instructor/${courseItem?.instructorId}`}
                          className="font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {courseItem?.instructorName}
                        </Link>
                      </p>

                      {/* Course Stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {courseItem?.curriculum?.length || 0}{" "}
                          {courseItem?.curriculum?.length <= 1 ? "Lecture" : "Lectures"}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5" />
                          {courseItem?.level}
                        </span>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-lg md:text-xl font-bold text-primary">
                          ${courseItem?.price}
                        </p>
                        
                        {enrolledCourses[courseItem?._id] ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/course-progress/${courseItem?._id}`);
                            }}
                          >
                            Continue
                          </Button>
                        ) : (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AddToCartButton
                              course={courseItem}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">No Courses Found</h2>
                <p className="text-muted-foreground mb-4 max-w-md">
                  We couldn't find any courses matching your filters. Try adjusting your search criteria.
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
