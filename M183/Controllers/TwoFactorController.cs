using Google.Authenticator;
using M183.Controllers.Dto;
using M183.Data;
using M183.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace M183.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TwoFactorController : ControllerBase
    {
        private readonly NewsAppContext _context;

        public TwoFactorController(NewsAppContext context)
        {
            _context = context;
        }

        [HttpGet("setup/{userId}")]
        public ActionResult<SetupCode> SetupTwoFactor(int userId)
        {
            var user = _context.Users.Find(userId);
            if (user == null) return NotFound();
            if (string.IsNullOrEmpty(user.TwoFactorSecret)) 
                return BadRequest("Enable 2FA first to get a secret key");

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();
            
            var setupInfo = tfa.GenerateSetupCode(
                "M183 Insecure App",
                user.Username,
                user.TwoFactorSecret,
                false,
                3); // Smaller QR code (3 = 150x150px)

            return Ok(new {
                QrCodeImageUrl = setupInfo.QrCodeSetupImageUrl,
                ManualEntryKey = setupInfo.ManualEntryKey,
                SecretKey = user.TwoFactorSecret,
                UserId = user.Id,
                Username = user.Username
            });
        }

        [HttpPost("activate")]
        public ActionResult ActivateTwoFactor(TwoFactorActivateDto request)
        {
            var user = _context.Users.Find(request.UserId);
            if (user == null) return NotFound();

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();
            bool isValid = tfa.ValidateTwoFactorPIN(
                user.TwoFactorSecret, 
                request.Code, 
                TimeSpan.FromSeconds(90)); // Increased time window to 90 seconds

            if (!isValid) return BadRequest("Invalid code");

            user.TwoFactorEnabled = true;
            _context.SaveChanges();

            return Ok();
        }
    }
}
