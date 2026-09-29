// backend-api/Endpoints/BillsEndpoints.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Endpoints;

public static class BillsEndpoints
{
    // Extension Method to map all bills-related routes onto the main application engine
    public static void MapBillsEndpoints(this IEndpointRouteBuilder app)
    {
        // Establish an internal route group container to centralize path boundaries
        var group = app.MapGroup("/api/bills");

        // --- ENDPOINT A: FETCH ALL OBLIGATIONS ---
        group.MapGet("/", async (RunwayDbContext db) =>
        {
            var bills = await db.Bills.AsNoTracking().ToListAsync();
            return Results.Ok(bills);
        });


        // --- ENDPOINT B: LOG NEW BUDGET ENTRY TRANSACTION ---
        app.MapPost("/api/bills", async ([FromBody] CreateBillRequest request, RunwayDbContext db) =>
        {
            // Strict contract safety valuation check
            if (string.IsNullOrWhiteSpace(request.Name) || request.Amount <= 0)
            {
                return Results.BadRequest("Invalid structural payload submission parameters.");
            }

            var entity = new BillEntity
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Amount = request.Amount,
                DueDate = request.DueDate,
                IsPaid = false,
                Category = request.Category
            };

            db.Bills.Add(entity);
            await db.SaveChangesAsync();

            return Results.Created($"/api/bills/{entity.Id}", entity);
        });

        // --- ENDPOINT C: TOGGLE STATE COMPLETION VIA ROUTE PATH ID MATCHING ---
        app.MapPatch("/api/bills/{id}/toggle", async (string id, RunwayDbContext db) =>
        {
            // The C# variable variable 'id' matches the extracted URL route token matching parameter '{id}'
            var bill = await db.Bills.FindAsync(id);

            if (bill == null)
            {
                return Results.NotFound($"Target obligation tracking record {id} missing from data layer.");
            }

            bill.IsPaid = !bill.IsPaid; // Invert in-memory boolean property parameters
            await db.SaveChangesAsync(); // Package transaction changes and push to disk parameters

            return Results.Ok(bill);
        });
    }
}