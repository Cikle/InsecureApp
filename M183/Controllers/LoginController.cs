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

        public LoginController(NewsAppContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;     // JWT-Konfiguration injiziert
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
                return BadRequest();
            }

            // First find user by username only
            User? user = _context.Users
                .FirstOrDefault(u => u.Username == request.Username);

            if (user == null)
            {
                // Return same error for invalid user/pass to prevent username enumeration
                return Unauthorized("Invalid username or password");
            }

            // Then verify password hash matches
            string hashedPassword = MD5Helper.ComputeMD5Hash(request.Password);
            if (user.Password != hashedPassword)
            {
                return Unauthorized("Invalid username or password");
            }
            if (user == null)
            {
                return Unauthorized("login failed");
            }

            var token = GenerateJwtToken(user);
            return Ok(token);
        }

        private string GenerateJwtToken(User user)
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
    }
}
