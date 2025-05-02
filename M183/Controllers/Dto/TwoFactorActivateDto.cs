namespace M183.Controllers.Dto
{
    public class TwoFactorActivateDto
    {
        public int UserId { get; set; }
        public string? Code { get; set; }
    }
}
