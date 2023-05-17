const getListUsers = (req, res) => {
    res.send('List of users')
}
const userDetails = (req, res) => {
    res.send('Details')
}

export default {
    getListUsers: getListUsers,
    userDetails: userDetails,
}
