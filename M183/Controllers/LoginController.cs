using M183.Controllers.Dto;
using M183.Controllers.Helper;
using M183.Data;
using M183.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace M183.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly NewsAppContext _context;
        private readonly IConfiguration _configuration; // Für JWT-Konfiguration
        private readonly ILogger<LoginController> _logger;

        public LoginController(NewsAppContext context, IConfiguration configuration, ILogger<LoginController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Login a user using password and username
        /// </summary>
        /// <response code="200">Login successfull</response>
        /// <response code="400">Bad request</response>
        /// <response code="401">Login failed</response>
        [HttpPost]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public ActionResult<string> Login(LoginDto request)
        {
            if (request == null || request.Username.IsNullOrEmpty() || request.Password.IsNullOrEmpty())
            {
                _logger.LogWarning("Invalid login request - missing username or password");
                return BadRequest();
            }

            // First find user by username only
            User? user = _context.Users
                .FirstOrDefault(u => u.Username == request.Username);

            if (user == null)
            {
                _logger.LogWarning("Login failed for username '{Username}' - user not found", request.Username);
                // Return same error for invalid user/pass to prevent username enumeration
                return Unauthorized("Invalid username or password");
            }

            // Then verify password hash matches
            string hashedPassword = MD5Helper.ComputeMD5Hash(request.Password);
            if (user.Password != hashedPassword)
            {
                _logger.LogWarning("Login failed for user '{Username}' - invalid password", user.Username);
                return Unauthorized("Invalid username or password");
            }
            if (user == null)
            {
                return Unauthorized("login failed");
            }

            var token = GenerateJwtToken(user);
            _logger.LogInformation("User '{Username}' logged in successfully", user.Username);
            return Ok(token);
        }

        private string GenerateJwtToken(User user)
        {
            try 
            {
        {
            var securityKey = new SymmetricSecurityKey(
                Convert.FromBase64String(_configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(
                securityKey, SecurityAlgorithms.HmacSha512Signature); // <-- Signaturalgorithmus

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "admin" : "user") // <-- Rolle für Autorisierung
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // <-- Gültigkeit
                signingCredentials: credentials);

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate JWT token for user {Username}", user.Username);
                throw;
            }
        }
    }
}
