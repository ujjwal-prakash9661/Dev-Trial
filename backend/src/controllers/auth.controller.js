const userModel = require('../models/user.model');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const generateToken = require('../utils/generate.token')

async function githubLogin(req, res)
{
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
        
    res.redirect(redirectUri);
}

async function githubCallBack(req, res)
{
    const code = req.query.code
    console.log("🔑 CODE:", code);

    if(!code)
    {
        return res.status(400).json({
            message : "Authorization code not provided"
        })
    }

    const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id : process.env.GITHUB_CLIENT_ID,
            client_secret : process.env.GITHUB_CLIENT_SECRET,
            code : code,
            redirect_uri : process.env.GITHUB_REDIRECT_URI
        },

        {
            headers : {
                Accept : "application/json"
            } 
        }
    )

    // console.log("🔑 TOKEN RESPONSE:", tokenResponse);

    const accessToken = tokenResponse.data.access_token;
    console.log("✅ Access Token:", accessToken);

    if(!accessToken)
    {
        return res.status(400).json({
            message : "Access token not provided",
            details: tokenResponse.data,
        })
    }

    const userResponse = await axios.get(
        "https://api.github.com/user",
        {
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        }
    )

    // console.log("👤 USER RESPONSE:", userResponse);

    const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        }
    )

    // console.log("📧 EMAIL RESPONSE:", emailResponse);

    const verifiedEmail = emailResponse.data.find((e) => e.verified && e.primary)?.email || emailResponse.data[0]?.email

    const userData = {
        githubId : userResponse.data.id.toString(),
        name : userResponse.data.name,
        username : userResponse.data.login,
        email : verifiedEmail,
        avatarUrl : userResponse.data.avatar_url,
        profileUrl : userResponse.data.html_url
    }

    // console.log("👤 USER DATA:", userData);

    let user = await userModel.findOne({ githubId : userData.githubId})

    if(!user)
    {
        user = await userModel.create(userData)
    }

    else
    {
        user.email = userData.email
        user.avatarUrl = userData.avatarUrl
        user.githubId = userData.githubId
        user.username = userData.username
        user.profileUrl = userData.profileUrl

        await user.save()
    }

    const token = generateToken(user._id)

    // console.log("🔐 JWT TOKEN:", token);

    res.cookie('token', token)

    res.redirect("http://localhost:5173/dashboard")

    // return res.status(200).json({
    //     message : "Logged In Successfully",
    //     token : token,
    //     user : user
    // })
}

async function logout(req, res)
{
    res.clearCookie('token')
    res.json({
        message : "Logged out successfully"
    })
}

async function getMe(req, res) 
{
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "Not authenticated" })

  try 
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.id)
    res.json(user)
  } 
  catch (err) 
  {
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = {
    githubLogin,
    githubCallBack,
    logout,
    getMe
}