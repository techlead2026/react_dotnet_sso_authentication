// backend-api/Program.cs
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
// Import our decoupled endpoints namespace contract
using backend_api.Endpoints;
using Microsoft.EntityFrameworkCore.Infrastructure;
using backend_api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// 1. REGISTER MICROSOFT ENTRA ID AUTHENTICATION INFRASTRUCTURE SERVICES
// Invokes the newly named domain service layer directly
builder.Services.AddEnterpriseIdentityGateway(builder.Configuration);

// 2. REGISTER DATABASE PERSISTENCE SERVICE HOOKS
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<RunwayDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions => 
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null)));

// 3. CORS ACCESS ALLOWANCES FOR DECOUPLED SPAS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 4. MIDDLEWARE PIPELINE ORDER EXECUTION ENGINE
app.UseCors("AllowReactClient");
app.UseAuthentication();
app.UseAuthorization();

// DATABASE SYSTEM SCHEMA SEED GENERATION INITIALIZER
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RunwayDbContext>();
    var relationalDependencies = dbContext.Database.GetService<Microsoft.EntityFrameworkCore.Storage.IRelationalDatabaseCreator>();
    try { relationalDependencies.CreateTables(); }
    catch (Exception) { Console.WriteLine("[SYSTEM] Database tables already present. Skipping creation."); }
}

// 5. CLEAN DECOUPLED REGISTRATION FUNCTION TRIGGER MAPPING HOOK
// Registers all your bills ledger API route loops silently in one clean line execution statement!
app.MapBillsEndpoints();

// START THE KESTREL APPLICATION MONITOR LISTENER ON PORT 5000
app.Run("http://localhost:5000");

// --- PHYSICAL CONTRACT PERSISTENT OBJECT INTERFACES ---
public class RunwayDbContext : DbContext
{
    public RunwayDbContext(DbContextOptions<RunwayDbContext> options) : base(options) { }
    public DbSet<BillEntity> Bills => Set<BillEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<BillEntity>().ToTable("bills");
    }
}

public class BillEntity
{
    [Key]
    public string Id { get; set; } = string.Empty;
    [Required, MaxLength(255)] public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    [Required] public string DueDate { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    [Required, MaxLength(100)] public string Category { get; set; } = string.Empty;
}

public record CreateBillRequest(string Name, decimal Amount, string DueDate, string Category);
