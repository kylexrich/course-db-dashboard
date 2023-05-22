Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a student, I want to be able to filter all courses by department and see the results in a table so that I can better plan my registration for my computer science degree

#### Definitions of Done(s)
Scenario 1: User filtering the data correctly with one filter and receiving the results
<br />Given: The user is on the Courses (or Rooms) page
<br />When: The user selects One Filter (or OR or AND) and adds a single filter from Filters, then selects columns, then clicks the perform query button
<br />Then: The generated table on the screen should display courses with only the courses (or Rooms) that satisfy the given filter

Scenario 2: User filtering the data correctly with multiple filters and receiving the results
<br />Given: The user is on the Courses (or Rooms) page
<br />When: The user selects AND (or OR) and adds multiple filters from Filters, then selects columns, then clicks the perform query button
<br />Then: The generated table on the screen should display courses with only the courses (or Rooms) that satisfy the given filters (if AND), or satisfy one of the given filters (if OR)

Scenario 3: User filtering the data correctly and receiving ResultTooLarge Error
<br />Given: The user is on the Courses (or Rooms) page
<br />When: The user selects AND (or OR or One Filter) and adds at leasy one filter from Filters, or selects "No Filter", then selects columns, then clicks the perform query button
<br />Then: There is an error saying "More than 5000 results found. Please try another query." on the screen because the filter has more than 5000 results

Scenario 4: User filtering the data incorrectly by using an incorrect value in Filters
<br />Given: The user is on the Courses (or Rooms) page
<br />When: The user selects AND (or OR or One Filter) and adds at least one filter, and at least one filter has "Select", or is a number filter field without a value
<br />Then: The user is unable to preform query because the preform query button is disabled


## User Story 2
As an academic professional, I want to be able to see all room names, the number of seats, room type, and furniture as columns in a table
so that I can pick a room for the final exam with all the necessary information at my fingertips.

#### Definitions of Done(s)
Scenario 1: User Selecting and Viewing Columns
<br />Given: The user is on the Rooms (or Courses) page and has filtered the data according to their needs and has not received an error
<br />When: The user selects the columns name, seats, type and furniture from the Columns section
<br />Then: The generated table on the screen should display the filtered data with only the columns name, seats, type and furniture

Scenario 2: User Does not Select Columns
<br />Given: The user is on the Rooms (or Courses) page and has filtered the data according to their needs
<br />When: The user does not select any columns from the Columns section
<br />Then: There is an error displayed on the screen saying "Please select the columns you want on the table."

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.
