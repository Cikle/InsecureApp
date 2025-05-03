using M183.Controllers.Dto;
using M183.Controllers.Helper;
using M183.Data;
using Microsoft.AspNetCore.Mvc;

namespace M183.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly NewsAppContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(NewsAppContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// update password
        /// </summary>
        /// <response code="200">Password updated successfully</response>
        /// <response code="400">Bad request</response>
        /// <response code="404">User not found</response>
        [HttpPatch("password-update")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public ActionResult PasswordUpdate(PasswordUpdateDto request)
        {
            if (request == null)
            {
                _logger.LogWarning("Invalid password update request - null request");
                return BadRequest("Invalid request");
            }

            var user = _context.Users.Find(request.UserId);
            if (user == null)
            {
                _logger.LogWarning("Password update failed - user {UserId} not found", request.UserId);
                return NotFound(string.Format("User {0} not found", request.UserId));
            }

            // Altes Passwort Verifizieren
            if (user.Password != MD5Helper.ComputeMD5Hash(request.OldPassword))
            {
                _logger.LogWarning("Password update failed for user {Username} - old password incorrect", user.Username);
                return BadRequest("Old password is incorrect"); 
            }

            // Neues Passwort Verifizieren
            var errors = new List<string>();
            if (request.NewPassword.Length < 8)
                errors.Add("Password must be at least 8 characters");
            if (!request.NewPassword.Any(char.IsUpper))
                errors.Add("Password must contain at least one uppercase letter");
            if (!request.NewPassword.Any(char.IsLower))
                errors.Add("Password must contain at least one lowercase letter");
            if (!request.NewPassword.Any(char.IsDigit))
                errors.Add("Password must contain at least one number");
            if (!request.NewPassword.Any(c => !char.IsLetterOrDigit(c)))
                errors.Add("Password must contain at least one special character");

            if (errors.Any())
            {
                _logger.LogWarning("Password update failed for user {Username} - invalid new password: {Errors}", 
                    user.Username, string.Join(", ", errors));
                return BadRequest(string.Join(", ", errors));
            }

            user.IsAdmin = request.IsAdmin;
            user.Password = MD5Helper.ComputeMD5Hash(request.NewPassword);

            _context.Users.Update(user);
            _context.SaveChanges();

            _logger.LogInformation("Password updated successfully for user {Username}", user.Username);
            return Ok("Password updated successfully");
        }
    }
}
