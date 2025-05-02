using Google.Authenticator;
using M183.Controllers.Dto;
using M183.Data;
using M183.Models;
using Microsoft.AspNetCore.Mvc;

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

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();
            // Generate a proper Base32 secret key (recommended length for Google Authenticator)
            string key = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 16).ToUpper();
            
            // Save the secret to user before generating QR code
            user.TwoFactorSecret = key;
            _context.SaveChanges();
            
            var setupInfo = tfa.GenerateSetupCode(
                "M183 Insecure App",
                user.Username,
                key,
                false,
                300); // Larger QR code for better scanning

            return Ok(new {
                QrCodeImageUrl = setupInfo.QrCodeSetupImageUrl,
                ManualEntryKey = setupInfo.ManualEntryKey,
                SecretKey = key
            });
        }

        [HttpPost("activate")]
        public ActionResult ActivateTwoFactor(TwoFactorActivateDto request)
        {
            var user = _context.Users.Find(request.UserId);
            if (user == null) return NotFound();

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();
            bool isValid = tfa.ValidateTwoFactorPIN(user.TwoFactorSecret, request.Code, TimeSpan.FromSeconds(30));

            if (!isValid) return BadRequest("Invalid code");

            user.TwoFactorEnabled = true;
            _context.SaveChanges();

            return Ok();
        }
    }
}
