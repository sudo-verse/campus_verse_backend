
# auth
post /signup
post /login
post /logout

# profile
get /profile/view
patch /profile/edit
patch /profile/edit/password

# request
post /request/send/interested/:userId
post /request/send/ignored/:userId
post /request/review/accepted/:requestId
post /request/review/rejected/:requestId

#