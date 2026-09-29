using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace backend_api.Extensions
{
    public static class AuthenticationExtensions
    {
        public static IServiceCollection AddEnterpriseIdentityGateway(this IServiceCollection services, IConfiguration configuration)
        {
            var azureAdSection = configuration.GetSection("AzureAd");
            var googleClientId = configuration["Google:ClientId"];

            // FIX Step 1: Capture the base standard AuthenticationBuilder instance
            var authBuilder = services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            });

            // FIX Step 2: Call Microsoft Identity on the base builder
            authBuilder.AddMicrosoftIdentityWebApi(azureAdSection, subscribeToJwtBearerMiddlewareDiagnosticsEvents: false);

            // FIX Step 3: Now you can safely call AddJwtBearer on the base builder without chain breaks
            authBuilder.AddJwtBearer("GoogleAuthScheme", options =>
            {
                options.Authority = "https://accounts.google.com";
                options.Audience = googleClientId; 

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = "https://accounts.google.com",
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true
                };
            });

            // UNIFIED AUTHORIZATION POLICY
            services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme, "GoogleAuthScheme")
                    .Build();
            });

            return services;
        }
    }
}
