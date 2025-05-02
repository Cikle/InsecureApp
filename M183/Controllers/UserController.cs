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

        public UserController(NewsAppContext context)
        {
            _context = context;
        }

        [HttpPost("enable-2fa/{userId}")]
        public ActionResult EnableTwoFactor(int userId)
        {
            var user = _context.Users.Find(userId);
            if (user == null) return NotFound();

            user.TwoFactorSecret = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10);
            _context.SaveChanges();

            return Ok(new { SecretKey = user.TwoFactorSecret });
        }

        [HttpPost("disable-2fa/{userId}")]
        public ActionResult DisableTwoFactor(int userId)
        {
            var user = _context.Users.Find(userId);
            if (user == null) return NotFound();

            user.TwoFactorSecret = null;
            user.TwoFactorEnabled = false;
            _context.SaveChanges();

            return Ok();
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
                return BadRequest();
            }

            var user = _context.Users.Find(request.UserId);
            if (user == null)
            {
                return NotFound(string.Format("User {0} not found", request.UserId));
            }
            user.IsAdmin = request.IsAdmin;
            user.Password = MD5Helper.ComputeMD5Hash(request.NewPassword);

            _context.Users.Update(user);
            _context.SaveChanges();

            return Ok();
        }
    }
}
