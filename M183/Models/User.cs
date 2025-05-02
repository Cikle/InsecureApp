using System.ComponentModel.DataAnnotations;

namespace M183.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
        public string? TwoFactorSecret { get; set; } // Neu für 2FA
        public bool TwoFactorEnabled { get; set; }   // Neu für 2FA
    }
}
