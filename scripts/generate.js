/**************************************************************************************************
 * Methods to generate the invoice pdf
 **************************************************************************************************/

// driver function for creating the invoice pdf from a json object
function generatePDF(data, save_to_cloud, save_to_device) {
    var doc = new jsPDF();
    var website = ''
    var totalPagesExp = '{total_pages_count_string}';
    var cantos_link = 'cantos.com'
    generateHeader(doc, data, website);
    generateInvoice(doc, data, totalPagesExp, website);

    if (save_to_cloud) {
        sendToFirestore(JSON.stringify(data));
    }

    if (save_to_device) {
        doc.save('generated_invoice.pdf');
        //saveAs(new Blob([doc.output('blob')], {type: 'application/pdf'}));
    }
    else {
        var blobpdf = new Blob([doc.output('blob')], {type: 'application/pdf'});
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blobpdf);
        window.open(link);

    }
}

// function to generate header part of the invoice
function generateHeader(doc, data, website) {
    var company_name = data['company_name'];
    var company_email = data['company_email'];
    var company_addr = data['company_addr'];
    var company_web = data['company_web'];
    var company_tel = data['company_tel'];

    var x_pos = 15;
    var y_pos = 10;

    if (data.logo_display) {
        var src = data['logo_display'];

        var element = document.createElement('div');
        element.innerHTML = src;
        
        var imageFormat = src.substring('<img src="data:image/'.length, src.search(";base64"));
        doc.addImage(element.firstChild, imageFormat, x_pos, y_pos, 35, 35, 'company_logo', 'NONE', 0);
        x_pos += 40;
    }

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 160, 240);

    y_pos += 7;
    doc.text(x_pos, y_pos, company_name);
    
    doc.setTextColor(0,0,0)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    
    // add only entered details into pdf
    if (company_email) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_email);
    }

    if (company_addr) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_addr);
    }
    
    if (company_web) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_web);
        website=company_web;
    }
    
    if (company_tel) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_tel);
    }

    // line to mark the end of header
    // y_pos = 47;
    // doc.line(10, y_pos, 200, 45);
}

// function to generate lower part of the invoice
function generateInvoice(doc, data, totalPagesExp ,website) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 160, 240);

    doc.text(85, 65, 'BILL RECEIPT')
    
    doc.setTextColor(0, 0, 0);

    client_name = data['client_name'];
    client_tel = data['client_tel'];
    client_place = data['client_place'];
    client_bill = data['client_bill'];
    invoice_date = data['invoice_date'];
    invoice_msg = data['invoice_msg'];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    var y_pos = 69;

    if (client_name) {
        y_pos += 5;
        doc.text(15, y_pos, 'To    : ' + client_name);
    }

    if (invoice_date) {
        y_pos += 5;
        doc.text(15, y_pos, 'Date : ' + invoice_date);
    }

    if (client_place) {
        y_pos += 5;
        doc.text(15, y_pos, 'Shipping Address: ' + client_place);
    }

    if (client_bill) {
        y_pos += 5;
        doc.text(15, y_pos, 'Billing Address: ' + client_place);
    }

    doc.text(15, y_pos + 10, '     ' + invoice_msg);

    // doc.setFontSize(10);// optional

    generatePurchaseList(doc, data, totalPagesExp, website);
}

function financial(x) {
    return Number.parseFloat(x).toFixed(2);
}

// function to generate the purchases table in the invoice
function generatePurchaseList(doc, data, totalPagesExp, website) {
    var purchase_list = data['purchase_list']['items'];



    var cantos_link='cantos.com';




    if (purchase_list.length == 1) {
        return;
    }

    var items = [];
    for (var i = 0; i < purchase_list.length - 1; i++) {
        item = purchase_list[i];
        items.push([item.Name, 
                    item.Qty, 
                    item.Cost + ' (+' + financial(item.Qty * item.Cost) + ')', 
                    item.Tax + '% (+'+ financial((item.Tax / 100.0) * (item.Qty * item.Cost)) +')', 
                    item.Discount + '% (-'+ financial((item.Discount / 100.0) * (item.Qty * item.Cost)) +')', 
                    financial(item.Total)]);
    }
    // last item i.e. total row
    item = purchase_list[purchase_list.length - 1];
    items.push(['[ TOTAL ]', item.Qty, item.Cost, item.Tax, item.Discount, financial(item.Total)]);

    var payment_list = data['purchase_list']['payment_data'];

    if (payment_list) {
        for (var i = 0; i < payment_list.length; i++) {
            item = payment_list[i];
            items.push([item.Name, item.Qty, item.Cost, item.Tax, item.Discount, financial(item.Total)]);
        }
    }
    else {
        items.push(['[ PAID ]', '', '', '', '', financial(item.Total)]);
        items.push(['[ BALANCE ]', '', '', '', '', financial(0)]);
    }

    doc.autoTable({
        startY: 110,
        halign: 'center',
        head: [[ "Name", "Qty", "Cost", "Tax %", "Discount %", "Total"]],
        body: items,
        didDrawPage: function (data) {
            var str = "Page " + doc.internal.getNumberOfPages()
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
            str = str + " of " + totalPagesExp;
        }
        doc.setFontSize(10);

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize;
        var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        // doc.text(data.settings.margin.left, pageHeight - 10, str);
        doc.text('Developed by Cantos Inc.', 150, pageHeight-10);
        // doc.text(data.settings.margin.left, pageHeight-10, website);
        // doc.textWithLink(data.settings.margin.left, pageHeight - 10, website, website);
    },
    margin: {top: 30}
    });
    if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
    }
}