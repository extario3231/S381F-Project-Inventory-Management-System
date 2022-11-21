# COMPS 381F Server-side Technologies And Cloud Computing Project

# Warehouse Management System

Group Members:

Hon Pak Hin   12358560

Ke Cheuk Lam  12465979

Yuen Chi Pang 12460622


## How to use
### Login
At the home page, there is a login session and you enter your login credentials. There is no limitation of username and password, you can just enter whatever you want, either usernmae or password or simply leave it empty. 

If you enter a username, your username will be stored. Then you will see 'Hi! <username>' on the page. If no username is entered, you will just see 'Hi!'.

After logging in, you will see the manage page, items stored in your MongoDB database will be display as a list and there are several CRUD buttons for you to manage your items and there is a logout button under the welcome message.

### CRUD Operations

You can insert, search, delete and update documents by pressing the corresponding buttons.

### Insert

Just input Name(Text), Type(Text), Quantity(Number) and Address(Text) and press 'Insert' button

or

Using the API function to insert a new item

localhost:3000/manage/insert/api/name/:n/type/:t/quantity/:q/address/:a

You should give those params a value(the letter after a ':' mark), otherwise, the app will crash.

### Search

Same as 'Insert', input anyone of the following, 

Name(Text), Type(Text), Quantity(Number) and Address(Text) and press 'Search' button. 

Then the result(s) will be shown on the manage page.

### Batch Delete

You must choose the check box on top of the item(s) when you want to delete the item(s), then click 'Batch Delete' button to complete the task.
The item(s) will be delete.

If you click the button of 'Batch Delete' when you do not choose any check box, "The connection was reset" will be shown & the app crash.

### Update

Click the 'Update' button under the item and you can change the anyone of the value. Finally, click 'Update' button and check the result in the manage page.

### Go back

Back to previous page when click the 'Go Back' Button.

### Logout

Click 'Log out' then back to login page and log out.

## HTTP Request Types
HTTP request types in this project include:
1. GET
2. POST

## Path URLs
Each path URL are named correspondingly to their function.
