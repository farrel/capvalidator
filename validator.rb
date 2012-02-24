require 'rubygems'
require 'sinatra'
require 'rcap'
require 'haml'
require 'coderay'
require 'rexml/formatters/pretty'
require 'open-uri'

XML_FORMATTER = REXML::Formatters::Pretty.new( 2 )
XML_FORMATTER.compact = true

get '/' do
  haml( :index )
end


post '/validate' do
  begin
    @cap_data = params[ :cap_data ]
    puts "<<"
    @alert = RCAP::Alert.from_xml( @cap_data )
    puts "<<"
    if @alert.valid?
      @xml_string = ""
      XML_FORMATTER.write( @alert.to_xml_document, @xml_string ) 
      haml( :validate )
    else
      haml( :error )
    end
  rescue => exception
    @alert = nil
    @exception = exception
    haml( :error )
  end
end

VALIDATE_URL = lambda do
  begin
    @cap_data_url = params[ :cap_data_url ]
    @cap_data = URI.parse( @cap_data_url ).read
    @alert = RCAP::Alert.from_xml( @cap_data )
    if @alert.valid?
      @xml_string = ""
      XML_FORMATTER.write( @alert.to_xml_document, @xml_string ) 
      haml( :validate )
    else
      haml( :error )
    end
  rescue => exception
    @alert = nil
    @exception = exception
    haml( :error )
  end
end

post( '/validate_url', &VALIDATE_URL )
get( '/validate_url', &VALIDATE_URL )

helpers do
  include Rack::Utils
  alias_method( :h, :escape_html )

  def cycle
    @_cycle ||= reset_cycle
    @_cycle = [@_cycle.pop] + @_cycle
    @_cycle.first
  end

  def current_cycle
    @_cycle.first
  end

  def reset_cycle
    @_cycle = %w(odd even)
  end

  def validate_file_path( alert_file_name )
    "/validate_url?cap_data_url=http://#{ request.host_with_port }/alerts/#{ alert_file_name }"
  end
end
